<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessAudioAnswer implements ShouldQueue
{
    use Queueable;

    private int $sessionQuestionId;
    private string $audioPath;


    /**
     * Create a new job instance.
     */
    public function __construct(int $sessionQuestionId, string $audioPath)
    {
        $this->sessionQuestionId = $sessionQuestionId;
        $this->audioPath = $audioPath;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Логика обработки аудио
    }
}
