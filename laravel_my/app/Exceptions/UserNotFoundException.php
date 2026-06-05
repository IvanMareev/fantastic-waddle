<?php

namespace App\Exceptions;

class UserNotFoundException extends BusinessException
{
    public function __construct()
    {
        parent::__construct(
            __('message.user_not_found'),
        );
    }

    public function getStatusCode(): int
    {
        return 404;
    }
}
