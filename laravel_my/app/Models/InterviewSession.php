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

/**
 * Class InterviewSession
 *
 * @property int $id
 * @property int $user_id
 * @property int $topic_id
 * @property int $total_questions
 * @property int $correct_answers
 * @property string $status
 * @property Carbon $started_at
 * @property Carbon|null $finished_at
 *
 * @property User $user
 * @property Topic $topic
 * @property Collection|SessionQuestion[] $session_questions
 *
 * @package App\Models
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
		'finished_at' => 'datetime'
	];

	protected $fillable = [
		'user_id',
		'topic_id',
		'total_questions',
		'correct_answers',
		'status',
		'started_at',
		'finished_at'
	];

	public function user(): BelongsTo
    {
		return $this->belongsTo(User::class);
	}

	public function topic(): BelongsTo
    {
		return $this->belongsTo(Topic::class);
	}

	public function session_questions(): HasMany|InterviewSession
    {
		return $this->hasMany(SessionQuestion::class, 'session_id');
	}
}
