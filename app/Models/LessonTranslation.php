<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonTranslation extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'locale',
        'title',
        'description',
        'content_blocks',
    ];

    protected function casts(): array
    {
        return [
            'content_blocks' => 'array',
        ];
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }
}
