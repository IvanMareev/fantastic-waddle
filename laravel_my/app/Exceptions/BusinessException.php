<?php

namespace App\Exceptions;

use RuntimeException;

abstract class BusinessException extends RuntimeException
{
    abstract public function getStatusCode(): int;
}
