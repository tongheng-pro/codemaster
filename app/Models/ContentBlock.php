<?php

namespace App\Models;

use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ContentBlock extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'section_id',
        'type',
        'sort_order',
        'page_number',
        'confidence',
        'needs_review',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'page_number' => 'integer',
            'confidence' => 'float',
            'needs_review' => 'boolean',
            'metadata' => 'array',
        ];
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function translations(): HasMany
    {
        return $this->hasMany(ContentBlockTranslation::class);
    }
}

