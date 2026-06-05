<?php

namespace App\DTO;

use App\Http\Requests\GetSessionAnswerRequest;

readonly class GetSessionAnswerData
{
    public function __construct(
        public int $sessionQuestionId,
    ) {}

    public static function fromRequest(
        GetSessionAnswerRequest $request
    ): self {
        return new self(
            sessionQuestionId: $request->integer('session_question_id'),
        );
    }
}
