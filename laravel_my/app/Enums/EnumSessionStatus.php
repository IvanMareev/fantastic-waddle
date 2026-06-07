<?php

namespace App\Enums;

enum EnumSessionStatus: string
{
    case IN_PROGRESS = 'in_progress';     // идёт интервью
    case COMPLETED = 'completed';         // завершено успешно
    case CANCELLED = 'cancelled';         // пользователь отменил
}
