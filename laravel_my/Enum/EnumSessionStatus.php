<?php

namespace App\Enums;

enum InterviewStatus: string
{
    case DRAFT = 'draft';                 // создана, но не начата
    case IN_PROGRESS = 'in_progress';     // идёт интервью
    case PAUSED = 'paused';               // пользователь поставил на паузу
    case WAITING_REVIEW = 'waiting_review'; // ждёт AI/проверки (если асинхронщина)
    case COMPLETED = 'completed';         // завершено успешно
    case FAILED = 'failed';               // провалено / ошибка
    case CANCELLED = 'cancelled';         // пользователь отменил
    case TIMEOUT = 'timeout';             // вышло время
}
