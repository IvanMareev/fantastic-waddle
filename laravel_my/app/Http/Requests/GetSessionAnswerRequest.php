<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GetSessionAnswerRequest extends FormRequest
{
    /**
     * @return array<string, array<int, string>|string>
     */
    public function rules(): array
    {
        return [
            'session_question_id' => 'required|integer|min:1',
        ];
    }
}
