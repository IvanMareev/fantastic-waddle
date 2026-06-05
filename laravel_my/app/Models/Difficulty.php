<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Class Difficulty
 *
 * @property int $id
 * @property string $name
 * @property Collection|Question[] $questions
 */
class Difficulty extends Model
{
    protected $table = 'difficulties';

    public $timestamps = false;

    protected $fillable = [
        'name',
    ];

    /**
     * @return HasMany<Question, $this>
     */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }
}
