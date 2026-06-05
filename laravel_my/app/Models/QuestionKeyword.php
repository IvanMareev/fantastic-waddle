<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class QuestionKeyword
 *
 * @property int $id
 * @property int $question_id
 * @property string $keyword
 * @property Question $question
 */
class QuestionKeyword extends Model
{
    protected $table = 'question_keywords';

    public $timestamps = false;

    protected $casts = [
        'question_id' => 'int',
    ];

    protected $fillable = [
        'question_id',
        'keyword',
    ];

    /**
     * @return BelongsTo<Question, $this>
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
