<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class UserAnswer
 * 
 * @property int $id
 * @property int $session_question_id
 * @property string|null $audio_file_url
 * @property string|null $transcript
 * @property bool|null $is_correct
 * @property string|null $ai_explanation
 * @property string|null $ai_audio_url
 * @property Carbon $created_at
 * 
 * @property SessionQuestion $session_question
 * @property Collection|AiEvaluation[] $ai_evaluations
 *
 * @package App\Models
 */
class UserAnswer extends Model
{
	protected $table = 'user_answers';
	public $timestamps = false;

	protected $casts = [
		'session_question_id' => 'int',
		'is_correct' => 'bool'
	];

	protected $fillable = [
		'session_question_id',
		'audio_file_url',
		'transcript',
		'is_correct',
		'ai_explanation',
		'ai_audio_url'
	];

	public function session_question()
	{
		return $this->belongsTo(SessionQuestion::class);
	}

	public function ai_evaluations()
	{
		return $this->hasMany(AiEvaluation::class);
	}
}
