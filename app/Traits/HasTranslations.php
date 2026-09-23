<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Model;

trait HasTranslations
{
    /**
     * Get the active or fallback translation for the model.
     */
    public function translation(?string $locale = null): ?Model
    {
        $targetLocale = $locale ?: app()->getLocale();

        // If translations relationship is already loaded, filter from collection
        if ($this->relationLoaded('translations')) {
            $match = $this->translations->firstWhere('locale', $targetLocale);
            if ($match) {
                return $match;
            }

            // Fallback to English
            return $this->translations->firstWhere('locale', 'en') ?: $this->translations->first();
        }

        // Query database
        $match = $this->translations()->where('locale', $targetLocale)->first();
        if ($match) {
            return $match;
        }

        // Fallback to English
        return $this->translations()->where('locale', 'en')->first() ?: $this->translations()->first();
    }

    /**
     * Get translated attribute with fallback.
     */
    public function getTranslated(string $attribute, ?string $locale = null, mixed $default = null): mixed
    {
        $translation = $this->translation($locale);

        return $translation ? ($translation->{$attribute} ?? $default) : $default;
    }
}
