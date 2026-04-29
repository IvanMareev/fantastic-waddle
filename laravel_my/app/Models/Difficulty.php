<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Difficulty
 * 
 * @property int $id
 * @property string $name
 * 
 * @property Collection|Question[] $questions
 *
 * @package App\Models
 */
class Difficulty extends Model
{
	protected $table = 'difficulties';
	public $timestamps = false;

	protected $fillable = [
		'name'
	];

	public function questions()
	{
		return $this->hasMany(Question::class);
	}
}
