<?php

namespace App\Services;

use App\Models\InterviewSession;
use App\Models\SessionQuestion;

class GetCurrentQuestionService
{
    public function execute(InterviewSession $session): SessionQuestion
    {
        return SessionQuestion::query()
            ->where('session_id', $session->id)
            ->with(['question'])->whereDoesntHave('userAnswer')->first();
    }
}
