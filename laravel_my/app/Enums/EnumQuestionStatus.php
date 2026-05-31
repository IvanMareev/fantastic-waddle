<?php

namespace App\Enums;

enum EnumQuestionStatus: string
{
    case Uploaded = 'uploaded';
    case SpeechToText = 'speech_to_text';
    case Analyzing = 'analyzing';
    case Completed = 'completed';
    case Failed = 'failed';
}
