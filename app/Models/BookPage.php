<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookPage extends Model
{
    use HasFactory;

    protected $fillable = [
        'book_id',
        'page_number',
        'extracted_text',
        'ocr_text',
        'page_image_path',
        'is_scanned',
        'processing_status',
        'confidence',
        'needs_review',
    ];

    protected function casts(): array
    {
        return [
            'page_number' => 'integer',
            'is_scanned' => 'boolean',
            'confidence' => 'float',
            'needs_review' => 'boolean',
        ];
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    /**
     * Get the effective text for this page (OCR text if scanned, else extracted text).
     */
    public function getEffectiveText(): string
    {
        if ($this->is_scanned && !empty($this->ocr_text)) {
            return $this->ocr_text;
        }

        return $this->extracted_text ?: ($this->ocr_text ?: '');
    }
}

