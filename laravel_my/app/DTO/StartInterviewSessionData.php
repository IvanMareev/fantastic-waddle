<?php

namespace App\DTO;

use App\Http\Requests\startSessionRequest;

final readonly class StartInterviewSessionData
{
    public static function fromRequest(StartSessionRequest $request): self
    {
        return new self(
            userId: $request->user()->id,
            questionIds: $request->validated()['question_ids'],
        );
    }
}
