<?php

namespace App\DTO;

use App\Http\Requests\AnswerQuestionRequest;
use Illuminate\Http\UploadedFile;

final readonly class AnswerQuestionData
{
    public function __construct(
        public UploadedFile $audio,
        public int $sessionQuestionId,
    ) {}

    public static function fromRequest(AnswerQuestionRequest $request): self
    {
        return new self(
            audio: $request->audio,
            sessionQuestionId: $request->session_question_id,
        );
    }
}
