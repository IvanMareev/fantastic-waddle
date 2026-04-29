<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Question
 * 
 * @property int $id
 * @property int $topic_id
 * @property int|null $difficulty_id
 * @property string $question_text
 * @property string $expected_answer
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Topic $topic
 * @property Difficulty|null $difficulty
 * @property Collection|QuestionKeyword[] $question_keywords
 * @property Collection|SessionQuestion[] $session_questions
 *
 * @package App\Models
 */
class Question extends Model
{
	protected $table = 'questions';

	protected $casts = [
		'topic_id' => 'int',
		'difficulty_id' => 'int'
	];

	protected $fillable = [
		'topic_id',
		'difficulty_id',
		'question_text',
		'expected_answer'
	];

	public function topic()
	{
		return $this->belongsTo(Topic::class);
	}

	public function difficulty()
	{
		return $this->belongsTo(Difficulty::class);
	}

	public function question_keywords()
	{
		return $this->hasMany(QuestionKeyword::class);
	}

	public function session_questions()
	{
		return $this->hasMany(SessionQuestion::class);
	}
}
