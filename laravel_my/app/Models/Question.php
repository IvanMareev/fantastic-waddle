<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
 * @property Topic $topic
 * @property Difficulty|null $difficulty
 * @property Collection|QuestionKeyword[] $question_keywords
 * @property Collection|SessionQuestion[] $session_questions
 */
class Question extends Model
{
    protected $table = 'questions';

    protected $casts = [
        'topic_id' => 'int',
        'difficulty_id' => 'int',
    ];

    protected $fillable = [
        'topic_id',
        'difficulty_id',
        'question_text',
        'expected_answer',
    ];

    /**
     * @return BelongsTo<Topic, $this>
     */
    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    /**
     * @return BelongsTo<Difficulty, $this>
     */
    public function difficulty(): BelongsTo
    {
        return $this->belongsTo(Difficulty::class);
    }

    /**
     * @return HasMany<QuestionKeyword, $this>
     */
    public function question_keywords(): HasMany
    {
        return $this->hasMany(QuestionKeyword::class);
    }

    /**
     * @return HasMany<SessionQuestion, $this>
     */
    public function session_questions(): HasMany
    {
        return $this->hasMany(SessionQuestion::class);
    }

    /**
     * @return HasMany<QuestionKeyword, $this>
     */
    public function keywords(): HasMany
    {
        return $this->hasMany(QuestionKeyword::class);
    }
}
