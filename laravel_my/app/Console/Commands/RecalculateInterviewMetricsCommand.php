<?php

namespace App\Console\Commands;

use App\Enums\EnumSessionStatus;
use App\Models\InterviewSession;
use Illuminate\Console\Command;

class RecalculateInterviewMetricsCommand extends Command
{
    protected $signature = 'recalculate:interview-metrics';

    public function handle(): void
    {
        $sessions = InterviewSession::query()->with([
            'sessionQuestions.question',
            'sessionQuestions.userAnswer',
        ])->get();

        foreach ($sessions as $session) {

            $answeredQuestions = $session->sessionQuestions
                ->filter(fn ($question) => $question->userAnswer !== null)
                ->count();

            $questions = $session->sessionQuestions()->count();

            $status = $questions >= $answeredQuestions ? EnumSessionStatus::COMPLETED : EnumSessionStatus::IN_PROGRESS;

            $session->update([
                'total_questions' => $questions,
                'answered_questions' => $answeredQuestions,
                'status' => $status,
            ]);

            $session->refresh();

        }
    }
}
