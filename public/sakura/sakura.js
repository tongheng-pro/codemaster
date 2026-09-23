/*!
 * Sakura Breeze — a GSAP cherry blossom mouse effect
 *
 * Mouse movement → sakura breeze → petals follow → rotate → drift → fade away.
 *
 * Requires GSAP 3.x loaded before this file:
 *   <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
 *
 * Configure by defining window.SAKURA_CONFIG before this script loads, e.g.
 *   <script>window.SAKURA_CONFIG = { maxParticles: 30, windStrength: 1.4 };</script>
 *
 * Runtime API: window.SakuraBreeze.init(), .destroy(), .config
 */
(function (window, document) {
    'use strict';

    /* ------------------------------------------------------------------
     * Configuration
     * ------------------------------------------------------------------ */
    var DEFAULTS = {
        maxParticles: 48, // hard cap on petals alive at once (DOM nodes are pooled and reused)
        spawnRate: 0.03, // petals per pixel the cursor travels (≈1–2 petals/s when slow, a breeze when fast)
        maxSpawnPerFrame: 3, // never create more than this many petals in one frame
        petalSize: [10, 18], // px, [min, max]
        blossomSize: [13, 19], // px, [min, max] for whole flowers
        duration: [2.4, 4.2], // seconds each petal lives, [min, max]
        windStrength: 1, // multiplier for how far petals are carried and drift
        windDirection: 0.35, // constant breeze bias: >0 drifts right, <0 drifts left
        gravity: [40, 120], // px each petal sinks over its lifetime, [min, max]
        mouseSensitivity: 1, // multiplier on measured mouse velocity
        followLag: 0.45, // seconds for the emitter to catch up with the cursor (higher = lazier)
        burstSpeed: 2.2, // px/ms — moving faster than this releases a burst
        burstCount: [4, 7], // petals per burst, [min, max]
        burstCooldown: 350, // ms between bursts
        clusterChance: 0.012, // chance per moving frame of a small flower cluster
        clusterCooldown: 2500, // ms between clusters
        ignoreSelector: 'input, textarea, select, [contenteditable="true"], .monaco-editor, [data-sakura-off]',
        zIndex: 45,
    };

    var CONFIG = Object.assign({}, DEFAULTS, window.SAKURA_CONFIG || {});

    // Soft spring palette: [base (darker, near the stem), middle, tip (lighter)]
    var PETAL_PALETTES = [
        ['#ef8fac', '#f6b6c9', '#fde2ea'],
        ['#e9809f', '#f3a9bf', '#fbd6e1'],
        ['#f4b3c6', '#f9cfdb', '#fff0f4'],
        ['#f09fb7', '#f7c2d1', '#fde8ee'],
    ];
    var BLOSSOM_CENTER = '#e27a98';
    var BLOSSOM_STAMEN = '#cf5c7e';

    // A single sakura petal with the characteristic notch at its tip (viewBox 0 0 20 28, stem at the bottom)
    var PETAL_PATH = 'M10 28 C3.2 22.4 0.2 14.6 1.8 7.4 C2.8 3 5.8 0.8 8.1 1.9 L10 4.9 L11.9 1.9 C14.2 0.8 17.2 3 18.2 7.4 C19.8 14.6 16.8 22.4 10 28 Z';
    var SVG_NS = 'http://www.w3.org/2000/svg';

    /* ------------------------------------------------------------------
     * Helpers
     * ------------------------------------------------------------------ */
    function random(min, max) {
        return min + Math.random() * (max - min);
    }

    function randomRange(range) {
        return random(range[0], range[1]);
    }

    function clamp(value, limit) {
        return Math.max(-limit, Math.min(limit, value));
    }

    /* ------------------------------------------------------------------
     * State
     * ------------------------------------------------------------------ */
    var container = null;
    var sprite = null;
    var allPetals = [];
    var freePetals = [];

    var emitter = { x: 0, y: 0 }; // lags behind the cursor via gsap.quickTo
    var moveEmitterX = null;
    var moveEmitterY = null;

    var mouseX = 0;
    var mouseY = 0;
    var lastX = 0;
    var lastY = 0;
    var lastTime = 0;
    var lastMoveTime = 0;
    var velocityX = 0; // px/ms, smoothed
    var velocityY = 0;
    var velocity = 0;
    var spawnBudget = 0;
    var hasPointer = false;
    var isOverIgnored = false;
    var isTicking = false;
    var lastBurstTime = 0;
    var lastClusterTime = 0;
    var isRunning = false;

    var reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    var finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

    /* ------------------------------------------------------------------
     * SVG artwork (one shared sprite, referenced by every petal)
     * ------------------------------------------------------------------ */
    function createSprite() {
        var defs = '';
        var symbols = '';

        PETAL_PALETTES.forEach(function (palette, index) {
            defs +=
                '<radialGradient id="sakura-grad-' + index + '" cx="0.5" cy="1" r="1.05">' +
                '<stop offset="0" stop-color="' + palette[0] + '"/>' +
                '<stop offset="0.55" stop-color="' + palette[1] + '"/>' +
                '<stop offset="1" stop-color="' + palette[2] + '"/>' +
                '</radialGradient>';

            symbols +=
                '<symbol id="sakura-petal-' + index + '" viewBox="0 0 20 28">' +
                '<path d="' + PETAL_PATH + '" fill="url(#sakura-grad-' + index + ')"/>' +
                '<path d="M10 26.5 C9.6 20 9.8 13 10 7.5" stroke="' + palette[0] + '" stroke-opacity="0.35" stroke-width="0.6" fill="none"/>' +
                '</symbol>';
        });

        // Five-petal blossom with a darker pink centre and tiny stamens
        var blossomPetals = '';
        var stamens = '';
        for (var i = 0; i < 5; i++) {
            blossomPetals +=
                '<path d="' + PETAL_PATH + '" fill="url(#sakura-grad-' + (i % 2 === 0 ? 2 : 3) + ')" ' +
                'transform="rotate(' + i * 72 + ') translate(-6 -17.6) scale(0.6)"/>';
            var angle = ((i * 72 + 36) * Math.PI) / 180;
            stamens +=
                '<circle cx="' + (Math.sin(angle) * 4.2).toFixed(2) + '" cy="' + (-Math.cos(angle) * 4.2).toFixed(2) + '" r="0.85" fill="' + BLOSSOM_STAMEN + '"/>';
        }
        symbols +=
            '<symbol id="sakura-blossom" viewBox="-19 -19 38 38">' +
            blossomPetals +
            '<circle r="3.1" fill="' + BLOSSOM_CENTER + '" fill-opacity="0.85"/>' +
            stamens +
            '</symbol>';

        sprite = document.createElementNS(SVG_NS, 'svg');
        sprite.setAttribute('class', 'sakura-breeze__sprite');
        sprite.setAttribute('aria-hidden', 'true');
        sprite.innerHTML = '<defs>' + defs + '</defs>' + symbols;
        document.body.appendChild(sprite);
    }

    /* ------------------------------------------------------------------
     * Petal pool — nodes are created lazily up to maxParticles and reused
     * ------------------------------------------------------------------ */
    function createPetal() {
        var el = document.createElement('div');
        el.className = 'sakura-breeze__petal';

        var inner = document.createElement('div');
        inner.className = 'sakura-breeze__inner';

        var svg = document.createElementNS(SVG_NS, 'svg');
        var use = document.createElementNS(SVG_NS, 'use');
        svg.appendChild(use);
        inner.appendChild(svg);
        el.appendChild(inner);
        container.appendChild(el);

        gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 0 });
        gsap.set(inner, { transformPerspective: 420 });

        var petal = { el: el, inner: inner, use: use, timeline: null };
        allPetals.push(petal);
        return petal;
    }

    function acquirePetal() {
        if (freePetals.length) {
            return freePetals.pop();
        }
        if (allPetals.length < CONFIG.maxParticles) {
            return createPetal();
        }
        return null; // at the cap: skip rather than pile up
    }

    function releasePetal(petal) {
        petal.timeline = null;
        gsap.set(petal.el, { opacity: 0 });
        freePetals.push(petal);
    }

    /**
     * Animate one petal or blossom.
     * carryX / carryY: how far the breeze pushes it (px), on top of the ambient wind and gravity.
     */
    function spawn(x, y, carryX, carryY, options) {
        var petal = acquirePetal();
        if (!petal) {
            return;
        }

        var isBlossom = options && options.blossom;
        var popIn = options && options.popIn;
        var wind = CONFIG.windStrength;
        var size = randomRange(isBlossom ? CONFIG.blossomSize : CONFIG.petalSize);
        var life = randomRange(CONFIG.duration) * (isBlossom ? 1.15 : 1);

        petal.use.setAttribute('href', isBlossom ? '#sakura-blossom' : '#sakura-petal-' + ((Math.random() * PETAL_PALETTES.length) | 0));
        petal.el.style.width = size + 'px';
        petal.el.style.height = (isBlossom ? size : size * 1.4) + 'px';

        var driftX = carryX * wind + random(-25, 45) * wind + CONFIG.windDirection * 60 * wind;
        var driftY = carryY * wind * 0.6 + randomRange(CONFIG.gravity);
        var swayDuration = random(0.7, 1.3);
        var swayRepeats = Math.max(1, Math.floor(life / swayDuration) - 1);
        var tiltLimit = isBlossom ? 25 : 45; // whole flowers flutter less than loose petals

        gsap.set(petal.el, { x: x, y: y, opacity: 0 });
        gsap.set(petal.inner, {
            x: 0,
            rotation: random(0, 360),
            rotationX: random(-tiltLimit, tiltLimit),
            rotationY: random(-tiltLimit, tiltLimit),
            scale: popIn ? 0.25 : random(0.75, 1),
        });

        var timeline = gsap.timeline({
            onComplete: function () {
                releasePetal(petal);
            },
        });

        timeline
            .to(petal.el, { opacity: random(0.85, 1), duration: 0.35, ease: 'power1.out' }, 0)
            // Carried by the breeze first, then easing out as the air calms
            .to(petal.el, { x: x + driftX, duration: life, ease: 'power2.out' }, 0)
            // Gravity: a gentle start that slowly gathers pace
            .to(petal.el, { y: y + driftY, duration: life, ease: 'sine.in' }, 0)
            // Slow spin in the plane of the screen
            .to(petal.inner, { rotation: '+=' + random(-220, 220) * (isBlossom ? 0.4 : 1), duration: life, ease: 'none' }, 0)
            // 3D flutter: the petal rocks back and forth like a falling leaf instead of spinning edge-on
            .to(
                petal.inner,
                {
                    rotationX: tiltLimit * (Math.random() < 0.5 ? -1 : 1),
                    rotationY: random(-tiltLimit, tiltLimit) * 0.6,
                    duration: random(0.9, 1.6),
                    ease: 'sine.inOut',
                    yoyo: true,
                    repeat: Math.max(1, Math.floor(life / 1.2)),
                },
                0
            )
            // Side-to-side sway of a falling petal
            .to(
                petal.inner,
                {
                    x: random(6, 14) * (Math.random() < 0.5 ? -1 : 1),
                    duration: swayDuration,
                    ease: 'sine.inOut',
                    yoyo: true,
                    repeat: swayRepeats,
                },
                0
            )
            .to(petal.el, { opacity: 0, duration: life * 0.4, ease: 'power1.in' }, life * 0.6);

        if (popIn) {
            timeline.to(petal.inner, { scale: random(0.8, 1.05), duration: 0.55, ease: 'back.out(2)' }, 0);
        }

        petal.timeline = timeline;
    }

    /* ------------------------------------------------------------------
     * Emission patterns
     * ------------------------------------------------------------------ */
    // Petals released slightly behind the (already lagging) emitter, carried along the movement
    function spawnTrailPetal(directionX, directionY) {
        var behind = random(4, 16);
        var x = emitter.x - directionX * behind + random(-10, 10);
        var y = emitter.y - directionY * behind + random(-10, 10);
        var carryX = clamp(velocityX * random(60, 150), 140);
        var carryY = clamp(velocityY * random(40, 100), 90);
        spawn(x, y, carryX, carryY);
    }

    // A fan of petals thrown forward when the mouse moves quickly
    function spawnBurst(directionX, directionY) {
        var count = Math.round(randomRange(CONFIG.burstCount));
        var baseAngle = Math.atan2(directionY, directionX);
        for (var i = 0; i < count; i++) {
            var angle = baseAngle + random(-0.9, 0.9);
            var distance = random(40, 110);
            spawn(emitter.x + random(-8, 8), emitter.y + random(-8, 8), Math.cos(angle) * distance, Math.sin(angle) * distance);
        }
    }

    // A small cluster: one or two flowers and a ring of petals spreading in every direction
    function spawnCluster() {
        var originX = emitter.x + random(-20, 20);
        var originY = emitter.y + random(-20, 20);
        var blossoms = Math.random() < 0.5 ? 1 : 2;
        var petals = Math.round(random(4, 6));

        for (var b = 0; b < blossoms; b++) {
            spawn(originX + random(-10, 10), originY + random(-10, 10), random(-20, 20), random(-10, 10), { blossom: true, popIn: true });
        }
        for (var i = 0; i < petals; i++) {
            var angle = (i / petals) * Math.PI * 2 + random(-0.3, 0.3);
            var distance = random(30, 70);
            spawn(originX, originY, Math.cos(angle) * distance, Math.sin(angle) * distance, { popIn: true });
        }
    }

    /* ------------------------------------------------------------------
     * Mouse tracking and the frame loop
     * ------------------------------------------------------------------ */
    function onMouseMove(event) {
        var now = performance.now();

        if (!hasPointer) {
            // First movement: start the emitter at the cursor instead of sliding in from the corner
            hasPointer = true;
            lastX = event.clientX;
            lastY = event.clientY;
            lastTime = now;
            gsap.set(emitter, { x: event.clientX, y: event.clientY });
        }

        var deltaTime = Math.max(now - lastTime, 8);
        var instantVelocityX = ((event.clientX - lastX) / deltaTime) * CONFIG.mouseSensitivity;
        var instantVelocityY = ((event.clientY - lastY) / deltaTime) * CONFIG.mouseSensitivity;

        // Smooth the raw velocity so a single jittery event does not cause a burst
        velocityX += (instantVelocityX - velocityX) * 0.35;
        velocityY += (instantVelocityY - velocityY) * 0.35;

        mouseX = lastX = event.clientX;
        mouseY = lastY = event.clientY;
        lastTime = lastMoveTime = now;

        moveEmitterX(mouseX);
        moveEmitterY(mouseY);

        var target = event.target;
        isOverIgnored = !!(CONFIG.ignoreSelector && target && target.closest && target.closest(CONFIG.ignoreSelector));

        startTicking();
    }

    function onTick() {
        var now = performance.now();
        var idleTime = now - lastMoveTime;

        // No new mousemove events: let the breeze die down
        if (idleTime > 60) {
            velocityX *= 0.85;
            velocityY *= 0.85;
        }

        velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

        // Fully calm: stop the loop until the mouse moves again (existing petals keep animating on their own)
        if (idleTime > 400 && velocity < 0.02) {
            stopTicking();
            return;
        }

        if (isOverIgnored || document.hidden) {
            spawnBudget = 0;
            return;
        }

        var frameMs = gsap.ticker.deltaRatio() * (1000 / 60);
        var directionX = velocity ? velocityX / velocity : 0;
        var directionY = velocity ? velocityY / velocity : 0;

        spawnBudget += velocity * frameMs * CONFIG.spawnRate;
        var count = Math.min(Math.floor(spawnBudget), CONFIG.maxSpawnPerFrame);
        spawnBudget = Math.min(spawnBudget - count, 1);

        for (var i = 0; i < count; i++) {
            spawnTrailPetal(directionX, directionY);
        }

        if (velocity > CONFIG.burstSpeed && now - lastBurstTime > CONFIG.burstCooldown) {
            lastBurstTime = now;
            spawnBurst(directionX, directionY);
        }

        if (velocity > 0.3 && now - lastClusterTime > CONFIG.clusterCooldown && Math.random() < CONFIG.clusterChance) {
            lastClusterTime = now;
            spawnCluster();
        }
    }

    function startTicking() {
        if (!isTicking) {
            isTicking = true;
            gsap.ticker.add(onTick);
        }
    }

    function stopTicking() {
        if (isTicking) {
            isTicking = false;
            gsap.ticker.remove(onTick);
        }
        spawnBudget = 0;
    }

    /* ------------------------------------------------------------------
     * Lifecycle
     * ------------------------------------------------------------------ */
    function shouldRun() {
        return typeof window.gsap !== 'undefined' && !reducedMotionQuery.matches && finePointerQuery.matches;
    }

    function init() {
        if (isRunning || !shouldRun()) {
            return;
        }
        isRunning = true;

        container = document.createElement('div');
        container.className = 'sakura-breeze';
        container.setAttribute('aria-hidden', 'true');
        container.style.setProperty('--sakura-z-index', String(CONFIG.zIndex));
        document.body.appendChild(container);
        createSprite();

        moveEmitterX = gsap.quickTo(emitter, 'x', { duration: CONFIG.followLag, ease: 'power3' });
        moveEmitterY = gsap.quickTo(emitter, 'y', { duration: CONFIG.followLag, ease: 'power3' });

        window.addEventListener('mousemove', onMouseMove, { passive: true });
    }

    function destroy() {
        if (!isRunning) {
            return;
        }
        isRunning = false;

        window.removeEventListener('mousemove', onMouseMove);
        stopTicking();
        allPetals.forEach(function (petal) {
            if (petal.timeline) {
                petal.timeline.kill();
            }
        });
        gsap.killTweensOf(emitter);

        if (container) {
            container.remove();
        }
        if (sprite) {
            sprite.remove();
        }
        container = sprite = null;
        allPetals = [];
        freePetals = [];
        hasPointer = false;
        velocityX = velocityY = velocity = 0;
    }

    // Follow OS settings live: turning on "reduce motion" or switching to touch stops the effect
    function onEnvironmentChange() {
        if (shouldRun()) {
            init();
        } else {
            destroy();
        }
    }

    [reducedMotionQuery, finePointerQuery].forEach(function (query) {
        if (query.addEventListener) {
            query.addEventListener('change', onEnvironmentChange);
        } else if (query.addListener) {
            query.addListener(onEnvironmentChange);
        }
    });

    window.SakuraBreeze = { init: init, destroy: destroy, config: CONFIG };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window, document);
