<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizAnswerTranslation extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_answer_id',
        'locale',
        'answer_text',
    ];

    public function answer(): BelongsTo
    {
        return $this->belongsTo(QuizAnswer::class, 'quiz_answer_id');
    }
}
