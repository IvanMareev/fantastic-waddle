<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SessionQuestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'question_order' => $this->question_order,

            'asked_at' => $this->asked_at,

            'question' => new QuestionResource(
                $this->whenLoaded('question')
            ),

            'user_answers' => new UserAnswerResource(
                $this->whenLoaded('userAnswer')
            ),
        ];
    }
}
