<?php

namespace App\DTO;

use App\Http\Requests\StartSessionRequest;

readonly class StartInterviewSessionData
{
    /**
     * @param  int[]  $questionIds
     */
    public function __construct(
        public int $userId,
        public array $questionIds,
    ) {}

    public static function fromRequest(StartSessionRequest $request): self
    {

        return new self(
            userId: $request->user()->id,
            questionIds: $request->validated('question_ids'),
        );
    }
}
