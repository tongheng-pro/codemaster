<?php

namespace App\Models;

use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Section extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'chapter_id',
        'section_number',
        'slug',
        'sort_order',
        'page_number',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'page_number' => 'integer',
        ];
    }

    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }

    public function translations(): HasMany
    {
        return $this->hasMany(SectionTranslation::class);
    }

    public function contentBlocks(): HasMany
    {
        return $this->hasMany(ContentBlock::class)->orderBy('sort_order');
    }
}

