<?php

namespace App\Jobs;

use App\Enums\EnumQuestionStatus;
use App\Models\UserAnswer;
use App\Services\YandexSttService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

class ProcessAudioAnswer implements ShouldQueue
{
    use Queueable;

    public $tries = 3;

    private int $sessionQuestionId;

    public function __construct(int $sessionQuestionId)
    {
        $this->sessionQuestionId = $sessionQuestionId;
    }

    /**
     * Запускает асинхронное распознавание речи и не блокирует worker:
     * результат собирает отдельный job (ProcessSttOperationJob).
     *
     * @throws Throwable
     */
    public function handle(YandexSttService $stt): void
    {
        $stt->assertConfigured();

        $userAnswer = UserAnswer::query()
            ->where('session_question_id', $this->sessionQuestionId)
            ->firstOrFail();

        $operationId = $stt->startRecognition($userAnswer);

        $userAnswer->update([
            'stt_operation_id' => $operationId,
            'processing_step' => EnumQuestionStatus::SpeechToText,
        ]);

        Log::info('STT RECOGNITION STARTED', [
            'operation_id' => $operationId,
            'session_question_id' => $this->sessionQuestionId,
        ]);

        ProcessSttOperationJob::dispatch($this->sessionQuestionId)
            ->delay(now()->addSeconds(15));
    }

    public function failed(Throwable $exception): void
    {
        UserAnswer::query()
            ->where('session_question_id', $this->sessionQuestionId)
            ->update(['processing_step' => EnumQuestionStatus::Failed]);

        Log::error('ProcessAudioAnswer HARD FAILED', [
            'session_question_id' => $this->sessionQuestionId,
            'error' => $exception->getMessage(),
        ]);
    }
}
