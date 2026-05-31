<?php

namespace App\Jobs;

use App\Enums\EnumSessionStatus;
use App\Enums\EnumQuestionStatus;
use App\Models\UserAnswer;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ProcessUploadAudioJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private readonly string $path,
        private readonly string $sessionQuestionId
    ) {}

    /**
     * @throws Throwable
     */
    public function handle(): void
    {
        Log::info('ProcessUploadAudioJob START', [
            'path' => $this->path,
        ]);

        try {
            $answer = UserAnswer::where('session_question_id', $this->sessionQuestionId)
                ->first();



            $fullPath = storage_path('app/public/' . $this->path);

            Log::info('Resolved full path', [
                'full_path' => $fullPath,
                'exists' => file_exists($fullPath),
            ]);

            if (!file_exists($fullPath)) {
                throw new Exception('File not found on disk: ' . $fullPath);
            }

            $extension = pathinfo($fullPath, PATHINFO_EXTENSION);

            $s3Path = 'interview_audio/' . uniqid() . '.' . $extension;

            Log::info('Uploading to S3', [
                's3_path' => $s3Path,
            ]);

            $result = Storage::disk('s3')->put(
                $s3Path,
                file_get_contents($fullPath)
            );

            if (!Storage::disk('s3')->exists($s3Path)) {
                throw new Exception('File not found in S3 after upload');
            }



            $res = $answer->update([
                'audio_file_url' => $s3Path,
                'processing_step' => EnumQuestionStatus::Uploaded

            ]);

            Log::info('S3 upload result', [
                'result' => $result,
                's3_path' => $s3Path,
                'session_question_id' => $this->sessionQuestionId,
                'answer' => $res,
            ]);

            if (!$result) {
                throw new Exception('S3 upload returned false');
            }

            Log::info('ProcessUploadAudioJob SUCCESS', [
                's3_path' => $s3Path,
            ]);

        } catch (Throwable $e) {
            Log::error('ProcessUploadAudioJob FAILED', [
                'message' => $e->getMessage(),
                'path' => $this->path,
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('ProcessUploadAudioJob HARD FAILED', [
            'error' => $exception->getMessage(),
            'path' => $this->path,
        ]);
    }
}
