<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AnswerQuestionRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'audio' => 'required|file|mimes:mp3,wav,ogg,m4a,webm|max:20480',
            'session_question_id' => 'required|integer|min:1'
        ];
    }
}
