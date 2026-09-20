<?php

namespace App\Services;

use App\DTO\GetAllSessionsData;
use App\Enums\EnumSessionStatus;
use App\Models\InterviewSession;
use Illuminate\Pagination\LengthAwarePaginator;

class GetAllSessionsService
{
    public function execute(
        GetAllSessionsData $data,
        ?InterviewSession $session = null,
    ): LengthAwarePaginator|InterviewSession {
        $query = InterviewSession::query()
            ->with([
                'sessionQuestions.question',
                'sessionQuestions.userAnswer',
            ])
            ->withCount([
                'userAnswers',
                'userAnswers as correct_answers_count' => fn ($q) => $q->where('is_correct', true),
            ])
            ->where('user_id', $data->userId)->where('status', EnumSessionStatus::IN_PROGRESS);

        if ($session) {
            return $query->findOrFail($session->id);
        }

        return $query->paginate(100);
    }
}
