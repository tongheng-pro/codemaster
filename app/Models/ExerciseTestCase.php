<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExerciseTestCase extends Model
{
    use HasFactory;

    protected $fillable = [
        'exercise_id',
        'assertion_type',
        'selector',
        'expected_value',
        'description',
        'is_hidden',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'is_hidden' => 'boolean',
            'order' => 'integer',
        ];
    }

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }
}
