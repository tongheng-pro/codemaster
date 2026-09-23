<?php

namespace App\Models;

use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CodeExample extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'lesson_id',
        'language',
        'initial_code',
        'solution_code',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'order' => 'integer',
        ];
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function translations(): HasMany
    {
        return $this->hasMany(CodeExampleTranslation::class);
    }
}
