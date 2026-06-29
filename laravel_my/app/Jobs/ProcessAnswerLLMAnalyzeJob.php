<?php

namespace App\Jobs;

use App\Enums\EnumQuestionStatus;
use App\Events\AnswerProcessedEvent;
use App\Models\Prompts;
use App\Models\Question;
use App\Models\SessionQuestion;
use App\Models\UserAnswer;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class ProcessAnswerLLMAnalyzeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(private readonly int $sessionQuestionId) {}

    /**
     * @throws Throwable
     * @throws ConnectionException
     */
    public function handle(): void
    {
        $userAnswer = UserAnswer::query()
            ->where('session_question_id', $this->sessionQuestionId)
            ->firstOrFail();

        $userAnswer->update([
            'processing_step' => EnumQuestionStatus::Analyzing,
        ]);

        $sessionQuestion = SessionQuestion::findOrFail(
            $userAnswer->session_question_id
        );

        $promptTemplate = Prompts::query()
            ->where('code', 'ANALYZE_ANSWER_V1')
            ->firstOrFail();

        $question = Question::findOrFail(
            $sessionQuestion->question_id
        );

        $prompt = str_replace(
            [
                '{{QUESTION}}',
                '{{USER_ANSWER}}',
                '{{CORRECT_ANSWER}}',
            ],
            [
                $question->question_text,
                $userAnswer->transcript,
                $question->expected_answer,
            ],
            $promptTemplate->system_prompt
        );

        try {

            $folderId = config('services.yandex.folder_id');
            $apiKey = config('services.yandex.api_key');

            Log::info('YANDEX CONFIG', [
                'folder_id' => $folderId,
                'api_key_exists' => ! empty($apiKey),
            ]);

            $response = Http::baseUrl('https://ai.api.cloud.yandex.net/v1')
                ->withHeaders([
                    'Authorization' => 'Api-Key '.$apiKey,
                    'Content-Type' => 'application/json',
                    'x-folder-id' => $folderId,
                ])
                ->timeout(120)
                ->post('/responses', [

                    'model' => "gpt://{$folderId}/yandexgpt/latest",

                    'temperature' => 0.3,

                    'input' => $prompt,

                    'max_output_tokens' => 1500,
                ]);

            Log::info('YANDEX RAW RESPONSE', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            if (! $response->successful()) {

                throw new Exception(
                    'Yandex API Error: '.$response->body()
                );
            }

            $data = $response->json();

            Log::info('YANDEX PARSED RESPONSE', [
                'data' => $data,
            ]);

            $result =
                $data['output'][0]['content'][0]['text']
                ?? null;

            if (! $result) {
                throw new Exception('LLM result is empty');
            }

            $result = preg_replace('/^```json\s*/', '', $result);
            $result = preg_replace('/^```\s*/', '', $result);
            $result = preg_replace('/\s*```$/', '', $result);

            $result = trim($result);

            $parsedResult = json_decode($result, true);

            if (json_last_error() !== JSON_ERROR_NONE) {

                throw new Exception(
                    'Invalid JSON from LLM: '.json_last_error_msg()
                );
            }

            Log::info('LLM RESULT', [
                'result' => $parsedResult,
            ]);

            $isCorrect = ($parsedResult['summary_score'] ?? 0) >= 4;
            $userAnswer->update([
                'ai_explanation' => $result,
                'is_correct' => $isCorrect,
                'processing_step' => EnumQuestionStatus::Completed,
            ]);

        } catch (Throwable $e) {

            Log::error('ProcessAnswerLLMAnalyzeJob FAILED', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }

        event(new AnswerProcessedEvent(
            $sessionQuestion->session,
            $userAnswer,
            $isCorrect
        ));

    }
}
