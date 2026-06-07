<?php

namespace App\Events;

use App\Models\InterviewSession;
use App\Models\UserAnswer;
use Illuminate\Foundation\Events\Dispatchable;

class AnswerProcessedEvent
{
    use Dispatchable;

    public function __construct(
        public readonly InterviewSession $session,
        public readonly UserAnswer $userAnswer,
        public readonly bool $isCorrect,
    ) {}
}
