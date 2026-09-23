<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookQuery extends Model
{
    use HasFactory;

    protected $fillable = [
        'book_id',
        'user_id',
        'question',
        'answer',
        'citations',
        'locale',
    ];

    protected function casts(): array
    {
        return [
            'citations' => 'array',
        ];
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

