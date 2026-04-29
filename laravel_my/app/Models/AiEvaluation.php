<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class AiEvaluation
 * 
 * @property int $id
 * @property int $user_answer_id
 * @property string|null $prompt_question
 * @property string|null $prompt_expected_answer
 * @property string|null $prompt_user_answer
 * @property string|null $model_name
 * @property string|null $raw_response
 * @property Carbon $created_at
 * 
 * @property UserAnswer $user_answer
 *
 * @package App\Models
 */
class AiEvaluation extends Model
{
	protected $table = 'ai_evaluations';
	public $timestamps = false;

	protected $casts = [
		'user_answer_id' => 'int'
	];

	protected $fillable = [
		'user_answer_id',
		'prompt_question',
		'prompt_expected_answer',
		'prompt_user_answer',
		'model_name',
		'raw_response'
	];

	public function user_answer()
	{
		return $this->belongsTo(UserAnswer::class);
	}
}
