<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    /**
     * Navbar items an admin can switch on or off, with their default state.
     *
     * @var array<string, bool>
     */
    public const NAVIGATION_DEFAULTS = [
        'courses' => false,
        'books' => true,
        'exercises' => true,
        'quizzes' => true,
        'playground' => true,
    ];

    /**
     * Site-wide visual effects an admin can choose from; only one runs at a time.
     *
     * @var list<string>
     */
    public const EFFECTS = [
        'none',
        'sakura',
        'snow',
        'leaves',
        'fireflies',
        'sparkles',
        'bubbles',
        'magic-dust',
        'hearts',
        'code',
        'confetti',
        'ripple',
    ];

    protected $fillable = ['key', 'value'];

    protected function casts(): array
    {
        return [
            'value' => 'array',
        ];
    }

    /**
     * Read a setting, cached until it is next saved.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $value = Cache::rememberForever("setting.{$key}", fn () => static::where('key', $key)->first()?->value);

        return $value ?? $default;
    }

    /**
     * Save a setting and refresh its cache.
     */
    public static function set(string $key, mixed $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
        Cache::forget("setting.{$key}");
    }

    /**
     * The active site effect. Falls back to the older on/off Sakura setting, and to Sakura when nothing was saved.
     */
    public static function siteEffect(): string
    {
        $effect = static::get('site_effect');

        if (is_string($effect) && in_array($effect, self::EFFECTS, true)) {
            return $effect;
        }

        return static::get('sakura_enabled', true) ? 'sakura' : 'none';
    }

    /**
     * Which navbar items are enabled, falling back to the defaults for items never saved.
     *
     * @return array<string, bool>
     */
    public static function navigation(): array
    {
        $saved = static::get('navigation', []);

        return array_map(
            fn (string $item) => (bool) ($saved[$item] ?? self::NAVIGATION_DEFAULTS[$item]),
            array_combine(array_keys(self::NAVIGATION_DEFAULTS), array_keys(self::NAVIGATION_DEFAULTS))
        );
    }
}
