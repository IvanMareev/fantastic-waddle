<?php

namespace App\Http\Resources;

use App\Models\UserAnswer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin UserAnswer
 */
class UserAnswerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'processing_step' => $this->processing_step,
            'transcript' => $this->transcript,
            'is_correct' => $this->is_correct,
            'score' => $this->score,
            'created_at' => $this->created_at,
            'session_question_id' => $this->session_question_id,
            'ai_explanation' => $this->ai_explanation,
        ];
    }
}
