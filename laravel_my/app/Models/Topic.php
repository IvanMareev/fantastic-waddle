<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Class Topic
 *
 * @property int $id
 * @property string $title
 * @property string|null $description
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Collection|Question[] $questions
 * @property Collection|InterviewSession[] $interview_sessions
 */
class Topic extends Model
{
    protected $table = 'topics';

    protected $casts = [
        'is_active' => 'bool',
    ];

    protected $fillable = [
        'title',
        'description',
        'is_active',
    ];

    /**
     * @return HasMany<Question, $this>
     */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }

    /**
     * @return HasMany<InterviewSession, $this>
     */
    public function interview_sessions(): HasMany
    {
        return $this->hasMany(InterviewSession::class);
    }
}
