<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Topic
 *
 * @property int $id
 * @property string $title
 * @property string|null $description
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 *
 * @property Collection|Question[] $questions
 * @property Collection|InterviewSession[] $interview_sessions
 *
 * @package App\Models
 */
class Topic extends Model
{
	protected $table = 'topics';

	protected $casts = [
		'is_active' => 'bool'
	];

	protected $fillable = [
		'title',
		'description',
		'is_active'
	];

	public function questions()
	{
		return $this->hasMany(Question::class);
	}

	public function interview_sessions()
	{
		return $this->hasMany(InterviewSession::class);
	}
}
