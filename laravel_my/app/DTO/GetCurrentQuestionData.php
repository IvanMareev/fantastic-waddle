<?php

namespace App\DTO;

use App\Http\Requests\GetCurrentQuestionRequest;

readonly class GetCurrentQuestionData
{
    public function __construct(
        public int $sessionQuestionId,
    ) {}

    public static function fromRequest(
        GetCurrentQuestionRequest $request
    ): self {
        return new self(
            sessionQuestionId: $request->integer('session_question_id'),
        );
    }
}
