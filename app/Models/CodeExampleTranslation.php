<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CodeExampleTranslation extends Model
{
    use HasFactory;

    protected $fillable = [
        'code_example_id',
        'locale',
        'title',
        'explanation',
    ];

    public function codeExample(): BelongsTo
    {
        return $this->belongsTo(CodeExample::class);
    }
}
