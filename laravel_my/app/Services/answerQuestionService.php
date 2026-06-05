<?php

namespace App\Services;

use App\DTO\AnswerQuestionData;
use App\Enums\EnumSessionStatus;
use App\Exceptions\SessionNotActiveException;
use App\Exceptions\SessionQuestionNotFoundException;
use App\Jobs\ProcessAnswerLLMAnalyzeJob;
use App\Jobs\ProcessAudioAnswer;
use App\Jobs\ProcessUploadAudioJob;
use App\Models\InterviewSession;
use App\Models\UserAnswer;
use Illuminate\Support\Facades\Bus;

class answerQuestionService
{
    /**
     * @throws SessionQuestionNotFoundException
     */
    public function execute(
        InterviewSession $session,
        AnswerQuestionData $data
    ): UserAnswer {
        if ($session->status !== EnumSessionStatus::IN_PROGRESS->value) {
            throw new SessionNotActiveException;
        }

        $sessionQuestion = $session
            ->sessionQuestions()
            ->find($data->sessionQuestionId);

        if (! $sessionQuestion) {
            throw new SessionQuestionNotFoundException;
        }

        $userAnswer = UserAnswer::where(
            'session_question_id',
            $data->sessionQuestionId
        )->first();

        if ($userAnswer) {
            return $userAnswer;
        }

        $audioPath = $data->audio->store(
            "interview_answers/{$session->id}",
            'public'
        );

        Bus::chain([
            new ProcessUploadAudioJob(
                $audioPath,
                $data->sessionQuestionId
            ),
            new ProcessAudioAnswer(
                $data->sessionQuestionId
            ),
            new ProcessAnswerLLMAnalyzeJob(
                $data->sessionQuestionId
            ),
        ])->dispatch();

        return UserAnswer::firstOrCreate([
            'session_question_id' => $data->sessionQuestionId,
        ]);
    }
}
