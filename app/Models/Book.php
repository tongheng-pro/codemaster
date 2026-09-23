<?php

namespace App\Models;

use App\Traits\HasTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Book extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'slug',
        'author',
        'original_language',
        'cover_image',
        'original_pdf_path',
        'total_pages',
        'processed_pages',
        'status',
        'processing_progress',
        'current_step',
        'error_message',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'total_pages' => 'integer',
            'processed_pages' => 'integer',
            'processing_progress' => 'integer',
            'is_published' => 'boolean',
        ];
    }

    public function translations(): HasMany
    {
        return $this->hasMany(BookTranslation::class);
    }

    public function pages(): HasMany
    {
        return $this->hasMany(BookPage::class)->orderBy('page_number');
    }

    public function chapters(): HasMany
    {
        return $this->hasMany(Chapter::class)->orderBy('sort_order');
    }

    public function sections(): HasManyThrough
    {
        return $this->hasManyThrough(Section::class, Chapter::class);
    }

    public function queries(): HasMany
    {
        return $this->hasMany(BookQuery::class);
    }
}

