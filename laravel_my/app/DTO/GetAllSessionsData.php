<?php

namespace App\DTO;

use App\Http\Requests\GetAllSessionsRequest;

class GetAllSessionsData
{
    public function __construct(
        public int $userId,
        public ?string $status = null,
        public ?int $perPage = null
    ) {}

    public static function fromRequest(
        GetAllSessionsRequest $request,
    ): self {
        return new self(
            userId: $request->user()->id,
            status: $request->status,
            perPage: $request->page
        );

    }
}
