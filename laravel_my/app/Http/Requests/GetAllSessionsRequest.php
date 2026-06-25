<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GetAllSessionsRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'status' => ['sometimes', 'string'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
