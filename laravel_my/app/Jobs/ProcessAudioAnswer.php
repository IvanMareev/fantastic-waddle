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

    private int $sessionQuestionId;

    public function __construct(int $sessionQuestionId)
    {
        $this->sessionQuestionId = $sessionQuestionId;
    }

    public function handle(): void
    {
        try {

            $apiKey = config('services.yandex.api_key');
            $folderId = config('services.yandex.folder_id');
            Log::info('ENV var', [$apiKey, $folderId]);

            $userAnswer = UserAnswer::where(
                'session_question_id',
                $this->sessionQuestionId
            )->first();

            if (! $userAnswer) {
                throw new Exception('UserAnswer not found');
            }

            if (! $userAnswer->audio_file_url) {
                throw new Exception('Audio file url is empty');
            }

            /*
            |--------------------------------------------------------------------------
            | S3 FILE
            |--------------------------------------------------------------------------
            */

            $s3Path = ltrim($userAnswer->audio_file_url, '/');

            Log::info('STT S3 FILE', [
                'path' => $s3Path,
                'session_question_id' => $this->sessionQuestionId,
            ]);

            if (! Storage::disk('s3')->exists($s3Path)) {
                throw new Exception("Audio file not found in S3: {$s3Path}");
            }

            /*
            |--------------------------------------------------------------------------
            | READ AUDIO CONTENT
            |--------------------------------------------------------------------------
            */

            $audioContent = Storage::disk('s3')->get($s3Path);

            if (! $audioContent) {
                throw new Exception('Failed to read audio content from S3');
            }

            Log::info('STT AUDIO LOADED', [
                'size' => strlen($audioContent),
            ]);

            /*
            |--------------------------------------------------------------------------
            | YA SPEECHKIT SYNC REQUEST
            |--------------------------------------------------------------------------
            */

            $url = 'https://stt.api.cloud.yandex.net/speech/v1/stt:recognize?'.http_build_query([
                'lang' => 'ru-RU',
                'folderId' => $folderId,
                'format' => 'oggopus',
            ]);

            Log::info('STT REQUEST START', [
                'url' => $url,
            ]);

            $userAnswer->update([
                'processing_step' => EnumQuestionStatus::SpeechToText,
            ]);

            $response = Http::withHeaders([
                'Authorization' => 'Api-Key '.$apiKey,
                'Content-Type' => 'application/octet-stream',
            ])
                ->withBody($audioContent, 'application/octet-stream')
                ->timeout(120)
                ->send('POST', $url);

            Log::info('STT RAW RESPONSE', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            /*
            |--------------------------------------------------------------------------
            | RESPONSE VALIDATION
            |--------------------------------------------------------------------------
            */

            if (! $response->successful()) {
                throw new Exception(
                    'STT request failed: '.$response->body()
                );
            }

            $data = $response->json();

            if (! $data) {
                throw new Exception('Empty STT response');
            }

            /*
            |--------------------------------------------------------------------------
            | PARSE TEXT
            |--------------------------------------------------------------------------
            */

            $text = trim($data['result'] ?? '');

            if (! $text) {

                Log::error('STT EMPTY RESULT', [
                    'response' => $data,
                ]);

                throw new Exception('Transcript is empty');
            }

            /*
            |--------------------------------------------------------------------------
            | SAVE TRANSCRIPT
            |--------------------------------------------------------------------------
            */

            $userAnswer->update([
                'transcript' => $text,
            ]);

            Log::info('STT SUCCESS', [
                'session_question_id' => $this->sessionQuestionId,
                'text' => $text,
            ]);

        } catch (Throwable $e) {

            Log::error('ProcessAudioAnswer failed', [
                'session_question_id' => $this->sessionQuestionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}
