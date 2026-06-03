<?php

namespace App\Services;

use App\Enums\EnumSessionStatus;
use App\Models\InterviewSession;
use Symfony\Component\HttpFoundation\Response;

readonly class StartInterviewSessionService
{
    public function execute($data): object {

        $user = $data->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => __('message.user_not_found'),
            ], Response::HTTP_UNAUTHORIZED);
        }

        $session = InterviewSession::create([
            'user_id' => $user->id,
            'status' => EnumSessionStatus::IN_PROGRESS,
            'started_at' => now(),
        ]);

        $sessionQuestions = collect($data['question_ids'])->map(function ($questionId, $index) {
            return [
                'question_id' => $questionId,
                'question_order' => $index + 1,
                'asked_at' => now(),
            ];
        })->all();

        $session->session_questions()->createMany($sessionQuestions);

        return response()->json([
            'success' => true,
            'message' => 'Сессия интервью успешно создана',
            'data' => $session->load('session_questions.question')
        ], Response::HTTP_CREATED);
    }
}
