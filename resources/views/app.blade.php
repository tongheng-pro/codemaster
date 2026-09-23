<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="icon" type="image/png" href="/images/mylogo-icon.png">
    <link rel="apple-touch-icon" href="/images/mylogo-touch.png">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Poppins:wght@400;500;600;700&family=Noto+Sans+Khmer:wght@400;500;600;700&display=swap" rel="stylesheet">

    <script>
        // Apply the saved theme before first paint to avoid a light/dark flash
        (function () {
            try {
                var theme = localStorage.getItem('theme') || 'system';
                var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                document.documentElement.classList.toggle('dark', isDark);
                document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
            } catch (e) {}
        })();
    </script>

    {{-- Site effect chosen in Admin → Settings (GSAP particles; off with reduced motion). Nothing loads when set to "none". --}}
    @php($siteEffect = \App\Models\Setting::siteEffect())
    @if ($siteEffect === 'sakura')
        <link rel="stylesheet" href="/sakura/sakura.css">
        <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" defer></script>
        <script src="/sakura/sakura.js" defer></script>
    @elseif ($siteEffect !== 'none')
        <link rel="stylesheet" href="/effects/effects.css">
        <script>window.SITE_EFFECT = @js($siteEffect);</script>
        <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" defer></script>
        <script src="/effects/effects.js" defer></script>
    @endif

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>
<body class="h-full bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 antialiased selection:bg-primary-500 selection:text-white">
    @inertia
</body>
</html>

