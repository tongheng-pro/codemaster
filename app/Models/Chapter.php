<?php

namespace App\Models;

use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Chapter extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'book_id',
        'chapter_number',
        'slug',
        'sort_order',
        'start_page',
        'end_page',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'chapter_number' => 'integer',
            'sort_order' => 'integer',
            'start_page' => 'integer',
            'end_page' => 'integer',
        ];
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    public function translations(): HasMany
    {
        return $this->hasMany(ChapterTranslation::class);
    }

    public function sections(): HasMany
    {
        return $this->hasMany(Section::class)->orderBy('sort_order');
    }
}

