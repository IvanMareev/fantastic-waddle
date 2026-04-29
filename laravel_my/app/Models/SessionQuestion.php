<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class SessionQuestion
 * 
 * @property int $id
 * @property int $session_id
 * @property int $question_id
 * @property int $question_order
 * @property Carbon $asked_at
 * 
 * @property InterviewSession $interview_session
 * @property Question $question
 * @property Collection|UserAnswer[] $user_answers
 *
 * @package App\Models
 */
class SessionQuestion extends Model
{
	protected $table = 'session_questions';
	public $timestamps = false;

	protected $casts = [
		'session_id' => 'int',
		'question_id' => 'int',
		'question_order' => 'int',
		'asked_at' => 'datetime'
	];

	protected $fillable = [
		'session_id',
		'question_id',
		'question_order',
		'asked_at'
	];

	public function interview_session()
	{
		return $this->belongsTo(InterviewSession::class, 'session_id');
	}

	public function question()
	{
		return $this->belongsTo(Question::class);
	}

	public function user_answers()
	{
		return $this->hasMany(UserAnswer::class);
	}
}
