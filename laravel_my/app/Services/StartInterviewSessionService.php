<?php

namespace App\Services;

use App\DTO\StartInterviewSessionData;
use App\Enums\EnumSessionStatus;
use App\Exceptions\UserNotFoundException;
use App\Models\InterviewSession;
use App\Models\User;

readonly class StartInterviewSessionService
{
    public function execute(StartInterviewSessionData $data): object
    {

        $user = User::find($data->userId);

        if (! $user) {
            throw new UserNotFoundException;
        }

        $session = InterviewSession::create([
            'user_id' => $user->id,
            'status' => EnumSessionStatus::IN_PROGRESS,
            'started_at' => now(),
        ]);

        $sessionQuestions = collect($data->questionIds)->map(function ($questionId, $index) {
            return [
                'question_id' => $questionId,
                'question_order' => $index + 1,
                'asked_at' => now(),
            ];
        })->all();

        $session->sessionQuestions()->createMany($sessionQuestions);

        return $session->load('sessionQuestions.question');
    }
}
