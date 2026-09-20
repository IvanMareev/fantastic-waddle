<?php

namespace App\Jobs;

use App\Enums\EnumQuestionStatus;
use App\Models\UserAnswer;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ProcessAudioAnswer implements ShouldQueue
{
    use Queueable;

    private const STT_RECOGNIZE_URL =
        'https://stt.api.cloud.yandex.net/stt/v3/recognizeFileAsync';

    private const STT_RECOGNITION_URL =
        'https://stt.api.cloud.yandex.net/stt/v3/getRecognition';

    private const OPERATION_URL =
        'https://operation.api.cloud.yandex.net/operations';

    private const OPERATION_CHECK_INTERVAL = 10;

    private const MAX_OPERATION_ATTEMPTS = 60;

    private int $sessionQuestionId;

    public function __construct(int $sessionQuestionId)
    {
        $this->sessionQuestionId = $sessionQuestionId;
    }

    public function handle(): void
    {
        try {
            /*
             |--------------------------------------------------------------------------
             | CONFIG
             |--------------------------------------------------------------------------
             */

            $apiKey = config('services.yandex.api_key');
            $folderId = config('services.yandex.folder_id');

            if (! $apiKey) {
                throw new Exception(
                    'Yandex API key is not configured'
                );
            }

            if (! $folderId) {
                throw new Exception(
                    'Yandex folder ID is not configured'
                );
            }

            $modelUri = "gpt://{$folderId}/aliceai-llm/latest";

            Log::info('YANDEX CONFIG', [
                'folder_id' => $folderId,
                'model_uri' => $modelUri,
                'session_question_id' => $this->sessionQuestionId,
            ]);

            /*
             |--------------------------------------------------------------------------
             | USER ANSWER
             |--------------------------------------------------------------------------
             */

            $userAnswer = $this->getUserAnswer();

            /*
             |--------------------------------------------------------------------------
             | S3 FILE
             |--------------------------------------------------------------------------
             */

            $s3Path = ltrim(
                $userAnswer->audio_file_url,
                '/'
            );

            Log::info('STT AUDIO FILE', [
                'path' => $s3Path,
                'session_question_id' => $this->sessionQuestionId,
            ]);

            if (! Storage::disk('s3')->exists($s3Path)) {
                throw new Exception(
                    "Audio file not found in S3: {$s3Path}"
                );
            }

            /*
             |--------------------------------------------------------------------------
             | BUILD S3 URI
             |--------------------------------------------------------------------------
             */

            $bucket = config(
                'filesystems.disks.s3.bucket'
            );

            if (! $bucket) {
                throw new Exception(
                    'S3 bucket is not configured'
                );
            }

            $fileUri = sprintf(
                'https://storage.yandexcloud.net/%s/%s',
                $bucket,
                $s3Path
            );

            Log::info('STT FILE URI', [
                'uri' => $fileUri,
                'session_question_id' => $this->sessionQuestionId,
            ]);

            /*
             |--------------------------------------------------------------------------
             | UPDATE PROCESSING STATUS
             |--------------------------------------------------------------------------
             */

            $userAnswer->update([
                'processing_step' => EnumQuestionStatus::SpeechToText,
            ]);

            /*
             |--------------------------------------------------------------------------
             | YANDEX STT + LLM REQUEST
             |--------------------------------------------------------------------------
             |
             | ВАЖНО:
             |
             | Этот запрос специально максимально близок
             | к рабочему Python-коду.
             |
             */

            $requestData = [
                'uri' => $fileUri,

                'recognitionModel' => [
                    'model' => 'general',

                    'audioFormat' => [
                        'containerAudio' => [
                            'containerAudioType' => 'OGG_OPUS',
                        ],
                    ],

                    'languageRestriction' => [
                        'restrictionType' => 'WHITELIST',

                        'languageCode' => [
                            'ru-RU',
                        ],
                    ],

                    'textNormalization' => [
                        'textNormalization' => 'TEXT_NORMALIZATION_DISABLED',
                    ],
                ],

                'speakerLabeling' => [
                    'speakerLabeling' => 'SPEAKER_LABELING_DISABLED',
                ],

                /*
                 |--------------------------------------------------------------------------
                 | SUMMARIZATION / LLM
                 |--------------------------------------------------------------------------
                 */

                'summarization' => [
                    'modelUri' => 'gpt://b1girvgot9ds0d2t2e8j/aliceai-llm/latest',

                    'properties' => [
                        [
                            /*
                             * ТЕСТОВЫЙ PROMPT.
                             *
                             * Если summarization работает,
                             * результат должен быть:
                             *
                             * meeeeeow
                             */
                            'instruction' => 'Верни строго одно слово: meeeeeow',

//                            'jsonSchema' => [
//                                'schema' => [
//                                    'fields' => [
//                                        'text' => [
//                                            'kind' => 'stringValue',
//                                            'stringValue' => 'text',
//                                        ],
//                                    ],
//                                ],
//                            ],
                        ],
                    ],
                ],
            ];

            /*
             |--------------------------------------------------------------------------
             | LOG REQUEST
             |--------------------------------------------------------------------------
             */

            Log::info('STT REQUEST START', [
                'session_question_id' => $this->sessionQuestionId,

                'request' => $requestData,
            ]);

            /*
             |--------------------------------------------------------------------------
             | SEND REQUEST
             |--------------------------------------------------------------------------
             */

            $response = Http::withHeaders([
                'Authorization' => 'Api-key '.$apiKey,
                'x-folder-id' => $folderId,
                'Content-Type' => 'application/json',
            ])
                ->timeout(120)
                ->post(
                    self::STT_RECOGNIZE_URL,
                    $requestData
                );

            /*
             |--------------------------------------------------------------------------
             | LOG INITIAL RESPONSE
             |--------------------------------------------------------------------------
             */

            Log::info('STT RECOGNITION RESPONSE', [
                'status' => $response->status(),
                'body' => $response->body(),
                'session_question_id' => $this->sessionQuestionId,
            ]);

            if (! $response->successful()) {
                throw new Exception(
                    'STT recognition request failed: '
                    .$response->status()
                    .' '
                    .$response->body()
                );
            }

            /*
             |--------------------------------------------------------------------------
             | OPERATION
             |--------------------------------------------------------------------------
             */

            $operationData = $response->json();

            if (! is_array($operationData)) {
                throw new Exception(
                    'Invalid operation response from Yandex'
                );
            }

            $operationId = $operationData['id'] ?? null;

            if (! $operationId) {
                throw new Exception(
                    'Operation ID not found in Yandex response'
                );
            }

            Log::info('STT OPERATION CREATED', [
                'operation_id' => $operationId,
                'session_question_id' => $this->sessionQuestionId,
            ]);

            /*
             |--------------------------------------------------------------------------
             | WAIT FOR OPERATION
             |--------------------------------------------------------------------------
             */

            $this->waitForOperation(
                operationId: $operationId,
                apiKey: $apiKey,
            );

            /*
             |--------------------------------------------------------------------------
             | GET RECOGNITION RESULT
             |--------------------------------------------------------------------------
             */

            $recognitionResponse = Http::withHeaders([
                'Authorization' => 'Api-key '.$apiKey,
                'x-folder-id' => $folderId,
            ])
                ->timeout(120)
                ->get(
                    self::STT_RECOGNITION_URL,
                    [
                        'operation_id' => $operationId,
                    ]
                );

            /*
             |--------------------------------------------------------------------------
             | LOG RAW RESPONSE
             |--------------------------------------------------------------------------
             */

            Log::info('YANDEX RAW RECOGNITION RESPONSE', [
                'status' => $recognitionResponse->status(),

                'body' => $recognitionResponse->body(),

                'session_question_id' => $this->sessionQuestionId,

                'operation_id' => $operationId,
            ]);

            if (! $recognitionResponse->successful()) {
                throw new Exception(
                    'Failed to get recognition result: '
                    .$recognitionResponse->status()
                    .' '
                    .$recognitionResponse->body()
                );
            }

            /*
             |--------------------------------------------------------------------------
             | PARSE RESPONSE
             |--------------------------------------------------------------------------
             */

            $events = $this->parseRecognitionResponse(
                $recognitionResponse->body()
            );

            Log::info('STT EVENTS PARSED', [
                'events_count' => count($events),

                'session_question_id' => $this->sessionQuestionId,
            ]);

            /*
             |--------------------------------------------------------------------------
             | DEBUG: SHOW ALL EVENTS
             |--------------------------------------------------------------------------
             */

            Log::info('STT ALL EVENTS', [
                'events' => $events,

                'session_question_id' => $this->sessionQuestionId,
            ]);

            /*
             |--------------------------------------------------------------------------
             | EXTRACT ORIGINAL TRANSCRIPT
             |--------------------------------------------------------------------------
             */

            $transcript = $this->extractTranscript(
                $events
            );

            if ($transcript === '') {
                Log::error('STT EMPTY TRANSCRIPT', [
                    'events' => $events,

                    'session_question_id' => $this->sessionQuestionId,
                ]);

                throw new Exception(
                    'Transcript is empty'
                );
            }

            /*
             |--------------------------------------------------------------------------
             | EXTRACT LLM RESULT
             |--------------------------------------------------------------------------
             */

            $processedTranscript =
                $this->extractSummarization(
                    $events
                );

            /*
             |--------------------------------------------------------------------------
             | DEBUG LLM RESULT
             |--------------------------------------------------------------------------
             */

            Log::info('STT LLM RESULT', [
                'processed_transcript' => $processedTranscript,

                'session_question_id' => $this->sessionQuestionId,
            ]);

            /*
             |--------------------------------------------------------------------------
             | SAVE RESULT
             |--------------------------------------------------------------------------
             */

            $updateData = [
                /*
                 * Оригинальный результат SpeechKit.
                 */
                'transcript' => $transcript,
            ];

            /*
             * Результат обработки LLM.
             */
            if ($processedTranscript !== null) {
                $updateData['processed_transcript'] =
                    $processedTranscript;
            }

            $userAnswer->update($updateData);

            /*
             |--------------------------------------------------------------------------
             | SUCCESS LOG
             |--------------------------------------------------------------------------
             */

            Log::info('STT SUCCESS', [
                'session_question_id' => $this->sessionQuestionId,

                'operation_id' => $operationId,

                'transcript' => $transcript,

                'processed_transcript' => $processedTranscript,
            ]);

        } catch (Throwable $e) {

            Log::error(
                'ProcessAudioAnswer failed',
                [
                    'session_question_id' => $this->sessionQuestionId,

                    'error' => $e->getMessage(),

                    'trace' => $e->getTraceAsString(),
                ]
            );

            throw $e;
        }
    }

    /**
     * Получить UserAnswer.
     */
    private function getUserAnswer(): UserAnswer
    {
        $userAnswer = UserAnswer::query()
            ->where(
                'session_question_id',
                $this->sessionQuestionId
            )
            ->first();

        if (! $userAnswer) {
            throw new Exception(
                'UserAnswer not found'
            );
        }

        if (! $userAnswer->audio_file_url) {
            throw new Exception(
                'Audio file URL is empty'
            );
        }

        return $userAnswer;
    }

    /**
     * Ожидание завершения Yandex operation.
     */
    private function waitForOperation(
        string $operationId,
        string $apiKey,
    ): void {
        $operationUrl =
            self::OPERATION_URL.'/'.$operationId;

        for (
            $attempt = 1;
            $attempt <= self::MAX_OPERATION_ATTEMPTS;
            $attempt++
        ) {
            $response = Http::withHeaders([
                'Authorization' => 'Api-key '.$apiKey,
            ])
                ->timeout(30)
                ->get($operationUrl);

            if (! $response->successful()) {
                Log::warning(
                    'STT OPERATION CHECK FAILED',
                    [
                        'operation_id' => $operationId,

                        'status' => $response->status(),

                        'body' => $response->body(),

                        'attempt' => $attempt,
                    ]
                );

                sleep(
                    self::OPERATION_CHECK_INTERVAL
                );

                continue;
            }

            $data = $response->json();

            if (! is_array($data)) {
                Log::warning(
                    'STT INVALID OPERATION RESPONSE',
                    [
                        'operation_id' => $operationId,

                        'body' => $response->body(),

                        'attempt' => $attempt,
                    ]
                );

                sleep(
                    self::OPERATION_CHECK_INTERVAL
                );

                continue;
            }

            $done = $data['done'] ?? false;

            Log::info('STT OPERATION STATUS', [
                'operation_id' => $operationId,

                'done' => $done,

                'attempt' => $attempt,
            ]);

            if ($done === true) {

                if (isset($data['error'])) {
                    throw new Exception(
                        'Yandex recognition operation failed: '
                        .json_encode(
                            $data['error'],
                            JSON_UNESCAPED_UNICODE
                            | JSON_PRETTY_PRINT
                        )
                    );
                }

                return;
            }

            sleep(
                self::OPERATION_CHECK_INTERVAL
            );
        }

        throw new Exception(
            "Yandex recognition operation timed out: {$operationId}"
        );
    }

    /**
     * Парсит NDJSON / JSON Lines.
     *
     * @return array<int, array<string, mixed>>
     */
    private function parseRecognitionResponse(
        string $body
    ): array {
        $events = [];

        $lines = preg_split(
            '/\R/',
            trim($body)
        );

        if ($lines === false) {
            throw new Exception(
                'Failed to split Yandex recognition response'
            );
        }

        foreach ($lines as $lineNumber => $line) {
            $line = trim($line);

            if ($line === '') {
                continue;
            }

            try {
                $data = json_decode(
                    $line,
                    true,
                    512,
                    JSON_THROW_ON_ERROR
                );
            } catch (\JsonException $e) {

                Log::warning(
                    'STT INVALID JSON LINE',
                    [
                        'line_number' => $lineNumber,

                        'line' => $line,

                        'error' => $e->getMessage(),
                    ]
                );

                continue;
            }

            if (! is_array($data)) {
                Log::warning(
                    'STT JSON LINE IS NOT ARRAY',
                    [
                        'line_number' => $lineNumber,

                        'line' => $line,
                    ]
                );

                continue;
            }

            $events[] = $data;
        }

        if ($events === []) {
            throw new Exception(
                'Yandex recognition response contains no valid JSON events'
            );
        }

        return $events;
    }

    /**
     * Извлекает оригинальный текст SpeechKit.
     *
     * @param array<int, array<string, mixed>> $events
     */
    private function extractTranscript(
        array $events
    ): string {
        foreach ($events as $event) {

            $final =
                $event['result']['final'] ?? null;

            if (! is_array($final)) {
                continue;
            }

            $alternatives =
                $final['alternatives'] ?? null;

            if (! is_array($alternatives)) {
                continue;
            }

            $alternative =
                $alternatives[0] ?? null;

            if (! is_array($alternative)) {
                continue;
            }

            $text = trim(
                (string) (
                    $alternative['text'] ?? ''
                )
            );

            if ($text !== '') {
                return $text;
            }
        }

        return '';
    }

    /**
     * Извлекает результат LLM summarization.
     *
     * @param array<int, array<string, mixed>> $events
     */
    private function extractSummarization(
        array $events
    ): ?string {
        foreach ($events as $event) {

            $summarization =
                $event['result']['summarization']
                ?? null;

            if (! is_array($summarization)) {
                continue;
            }

            Log::info('STT SUMMARIZATION FOUND', [
                'summarization' => $summarization,

                'session_question_id' => $this->sessionQuestionId,
            ]);

            $results =
                $summarization['results']
                ?? null;

            if (! is_array($results)) {
                continue;
            }

            foreach ($results as $result) {

                if (! is_array($result)) {
                    continue;
                }

                $response =
                    $result['response']
                    ?? null;

                Log::info('STT SUMMARIZATION RESPONSE', [
                    'response' => $response,

                    'session_question_id' => $this->sessionQuestionId,
                ]);

                if (
                    is_string($response)
                    && trim($response) !== ''
                ) {
                    return $this->cleanSummarization(
                        $response
                    );
                }
            }
        }

        Log::warning('STT SUMMARIZATION NOT FOUND', [
            'events' => $events,

            'session_question_id' => $this->sessionQuestionId,
        ]);

        return null;
    }

    /**
     * Очищает ответ LLM.
     */
    private function cleanSummarization(
        string $response
    ): string {
        $response = trim($response);

        /*
         |--------------------------------------------------------------------------
         | REMOVE MARKDOWN CODE FENCE
         |--------------------------------------------------------------------------
         */

        $response = preg_replace(
            '/^```(?:json)?\s*/i',
            '',
            $response
        );

        $response = preg_replace(
            '/\s*```$/',
            '',
            $response
        );

        $response = trim($response);

        /*
         |--------------------------------------------------------------------------
         | TRY JSON
         |--------------------------------------------------------------------------
         */

        try {

            $json = json_decode(
                $response,
                true,
                512,
                JSON_THROW_ON_ERROR
            );

            if (
                is_array($json)
                && isset($json['text'])
                && is_string($json['text'])
            ) {
                return trim(
                    $json['text']
                );
            }

        } catch (\JsonException) {
            /*
             * Ответ может быть обычной строкой.
             */
        }

        return trim($response);
    }
}
