<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Class InterviewSession
 *
 * @property int $id
 * @property int $user_id
 * @property int $topic_id
 * @property int $total_questions
 * @property int $correct_answers
 * @property int answered_questions
 * @property string $status
 * @property Carbon $started_at
 * @property Carbon|null $finished_at
 * @property User $user
 * @property Topic $topic
 * @property Collection|SessionQuestion[] $session_questions
 */
class InterviewSession extends Model
{
    protected $table = 'interview_sessions';

    public $timestamps = false;

    protected $casts = [
        'user_id' => 'int',
        'topic_id' => 'int',
        'total_questions' => 'int',
        'correct_answers' => 'int',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'answered_questions' => 'int',
    ];

    protected $fillable = [
        'user_id',
        'topic_id',
        'total_questions',
        'correct_answers',
        'answered_questions',
        'status',
        'started_at',
        'finished_at',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Topic, $this>
     */
    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    /**
     * @return HasMany<SessionQuestion, $this>
     */
    public function sessionQuestions(): HasMany
    {
        return $this->hasMany(SessionQuestion::class, 'session_id');
    }

    public function userAnswers(): HasOne
    {
        return $this->hasOne(UserAnswer::class, 'session_question_id');
    }
}
