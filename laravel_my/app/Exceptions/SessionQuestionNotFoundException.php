<?php

namespace App\Exceptions;

class SessionQuestionNotFoundException extends BusinessException
{
    public function __construct()
    {
        parent::__construct(
            __('message.question_not_found')
        );
    }

    public function getStatusCode(): int
    {
        return 404;
    }
}
