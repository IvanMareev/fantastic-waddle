<?php

namespace App\Services;

use App\DTO\GetSessionAnswerData;
use App\Exceptions\AnswerNotFoundException;
use App\Exceptions\SessionQuestionNotFoundException;
use App\Models\InterviewSession;
use App\Models\SessionQuestion;
use App\Models\UserAnswer;

class GetSessionAnswerService
{
    public function __construct() {}

    public function execute(InterviewSession $session, GetSessionAnswerData $data): UserAnswer
    {
        /** @var SessionQuestion|null $sessionQuestion */
        $sessionQuestion = $session->sessionQuestions()->where('id', $data->sessionQuestionId)->first();

        if (! $sessionQuestion) {
            throw new SessionQuestionNotFoundException;
        }

        $userAnswer = UserAnswer::where('session_question_id', $sessionQuestion->id)->first();

        if (! $userAnswer) {
            throw new AnswerNotFoundException;
        }

        return $userAnswer;
    }
}
