<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Class SessionQuestion
 *
 * @property int $id
 * @property int $session_id
 * @property int $question_id
 * @property int $question_order
 * @property Carbon $asked_at
 * @property InterviewSession $interview_session
 * @property Question $question
 * @property Collection|UserAnswer[] $user_answers
 */
class SessionQuestion extends Model
{
    protected $table = 'session_questions';

    public $timestamps = false;

    protected $casts = [
        'session_id' => 'int',
        'question_id' => 'int',
        'question_order' => 'int',
        'asked_at' => 'datetime',
    ];

    protected $fillable = [
        'session_id',
        'question_id',
        'question_order',
        'asked_at',
        'answer_audio_path',
        'answered_at',
        'answer_text',
    ];

    /**
     * @return BelongsTo<InterviewSession, $this>
     */
    public function interview_session(): BelongsTo
    {
        return $this->belongsTo(InterviewSession::class, 'session_id');
    }

    /**
     * @return BelongsTo<Question, $this>
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    /**
     * @return HasMany<UserAnswer, $this>
     */
    public function user_answers(): HasMany
    {
        return $this->hasMany(UserAnswer::class);
    }
}
