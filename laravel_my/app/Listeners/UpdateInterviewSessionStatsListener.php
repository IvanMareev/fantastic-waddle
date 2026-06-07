<?php

namespace App\Listeners;

use App\Enums\EnumSessionStatus;
use App\Events\AnswerProcessedEvent;

class UpdateInterviewSessionStatsListener
{
    public function __construct() {}

    public function handle(AnswerProcessedEvent $event): void
    {
        $session = $event->session;
        $totalQuestions = $session->total_questions;

        if ($totalQuestions == null) {
            $countSessionQuestion = $session->sessionQuestions()->count();
            $session->update([
                'total_questions' => $countSessionQuestion,
            ]);
        }

        $session->increment('answered_questions');

        if ($event->isCorrect) {
            $session->increment('correct_answers');
        }

        $session->refresh();

        if ($session->answered_questions >= $session->total_questions) {
            $session->update([
                'status' => EnumSessionStatus::COMPLETED,
            ]);
        }
    }
}
