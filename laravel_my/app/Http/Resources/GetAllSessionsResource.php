<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GetAllSessionsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'status' => $this->status,

            'started_at' => $this->started_at,
            'finished_at' => $this->finished_at,

            'questions_count' => $this->sessionQuestions->count(),

            'answered_questions_count' => $this->user_answers_count,

            'correct_answers_count' => $this->correct_answers_count,

            'session_questions' => SessionQuestionResource::collection(
                $this->whenLoaded('sessionQuestions')
            ),
        ];
    }
}
