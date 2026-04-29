<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class QuestionKeyword
 * 
 * @property int $id
 * @property int $question_id
 * @property string $keyword
 * 
 * @property Question $question
 *
 * @package App\Models
 */
class QuestionKeyword extends Model
{
	protected $table = 'question_keywords';
	public $timestamps = false;

	protected $casts = [
		'question_id' => 'int'
	];

	protected $fillable = [
		'question_id',
		'keyword'
	];

	public function question()
	{
		return $this->belongsTo(Question::class);
	}
}
