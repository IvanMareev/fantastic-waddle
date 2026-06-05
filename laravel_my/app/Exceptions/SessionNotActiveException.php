<?php

namespace App\Exceptions;

class SessionNotActiveException extends BusinessException
{
    public function __construct()
    {
        parent::__construct(
            __('message.session_not_active')
        );
    }

    public function getStatusCode(): int
    {
        return 400;
    }
}
