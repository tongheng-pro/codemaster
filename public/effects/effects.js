/*!
 * Site Effects — ten lightweight GSAP particle effects sharing one engine.
 *
 *   Background: snow, leaves, fireflies
 *   Mouse trail: sparkles, bubbles, magic-dust, hearts, code
 *   Click / tap: confetti, ripple
 *
 * Requires GSAP 3.x loaded before this file:
 *   <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
 *
 * Choose the effect with window.SITE_EFFECT = 'snow' before this script loads,
 * or at runtime with SiteEffects.start('snow') / SiteEffects.stop().
 *
 * Every effect: pooled DOM nodes with a hard cap, transform/opacity-only animation,
 * click-through layer, off with prefers-reduced-motion. Mouse trails need a mouse
 * (off on touch screens); background effects are halved on touch screens.
 */
(function (window, document) {
    'use strict';

    var SVG_NS = 'http://www.w3.org/2000/svg';

    /* ------------------------------------------------------------------
     * Helpers
     * ------------------------------------------------------------------ */
    function random(min, max) {
        return min + Math.random() * (max - min);
    }

    function pick(items) {
        return items[(Math.random() * items.length) | 0];
    }

    function svg(viewBox, body) {
        return '<svg xmlns="' + SVG_NS + '" viewBox="' + viewBox + '">' + body + '</svg>';
    }

    var reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    var finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

    /* ------------------------------------------------------------------
     * Artwork (tiny inline SVGs, coloured with currentColor)
     * ------------------------------------------------------------------ */
    var SHAPES = {
        snowflake: svg(
            '-10 -10 20 20',
            '<g stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none">' +
                [0, 60, 120]
                    .map(function (angle) {
                        return (
                            '<g transform="rotate(' + angle + ')">' +
                            '<line x1="0" y1="-9" x2="0" y2="9"/>' +
                            '<polyline points="-2.5,-7 0,-4.8 2.5,-7"/>' +
                            '<polyline points="-2.5,7 0,4.8 2.5,7"/>' +
                            '</g>'
                        );
                    })
                    .join('') +
                '</g>'
        ),
        leaf: svg(
            '-10 -12 20 24',
            '<path d="M0 -11 C7 -7 9 1 0 11 C-9 1 -7 -7 0 -11 Z" fill="currentColor"/>' +
                '<path d="M0 10 L0 -8 M0 -1 L4 -5 M0 3 L-4 -1 M0 6 L3.5 3" stroke="rgba(0,0,0,0.18)" stroke-width="0.8" fill="none"/>'
        ),
        star: svg('-10 -10 20 20', '<path d="M0 -10 C1 -2 2 -1 10 0 C2 1 1 2 0 10 C-1 2 -2 1 -10 0 C-2 -1 -1 -2 0 -10 Z" fill="currentColor"/>'),
        heart: svg(
            '-10 -9 20 17',
            '<path d="M0 7 C-8 1 -9.5 -4 -6 -6.8 C-3.2 -8.6 -0.9 -7 0 -5.2 C0.9 -7 3.2 -8.6 6 -6.8 C9.5 -4 8 1 0 7 Z" fill="currentColor"/>'
        ),
    };

    var LEAF_COLORS = ['#d9822b', '#c8551f', '#e0a43a', '#b5471b', '#9c6b2f', '#e4b04a'];
    var SPARKLE_COLORS = ['#f5b82e', '#ffd66b', '#7cc4ff', '#c69bff', '#ff9ec4'];
    var HEART_COLORS = ['#ff6b8b', '#ff8fa8', '#f25c7a', '#ffa3b8', '#e84a6f'];
    var CONFETTI_COLORS = ['#0a84ff', '#ff375f', '#ffd60a', '#30d158', '#bf5af2', '#ff9f0a', '#64d2ff'];
    var CODE_COLORS = ['#0a84ff', '#5e5ce6', '#30b0c7', '#bf5af2', '#34c759'];
    var CODE_GLYPHS = ['{ }', '</>', ';', '( )', '=>', '[ ]', '#', '&&', '$', '++', '//', '!='];

    /* ------------------------------------------------------------------
     * Particle layer and node pool
     * ------------------------------------------------------------------ */
    var layer = null;
    var allNodes = [];
    var freeNodes = [];
    var nodeCap = 60;

    function acquireNode() {
        if (freeNodes.length) {
            return freeNodes.pop();
        }
        if (allNodes.length >= nodeCap) {
            return null; // at the cap: skip rather than pile up
        }
        var node = document.createElement('div');
        layer.appendChild(node);
        allNodes.push(node);
        return node;
    }

    function releaseNode(node) {
        node.fxTimeline = null;
        // A node from an effect that was already stopped must not join the new effect's pool
        if (node.parentNode !== layer) {
            return;
        }
        gsap.killTweensOf(node);
        node.className = 'site-fx__p';
        node.removeAttribute('style');
        node.innerHTML = '';
        freeNodes.push(node);
    }

    /**
     * Prepare a pooled node. Returns null when the pool is full.
     * options: { html, className, width, height, color, background, fontSize }
     */
    function createParticle(x, y, options) {
        var node = acquireNode();
        if (!node) {
            return null;
        }
        node.className = 'site-fx__p' + (options.className ? ' ' + options.className : '');
        node.innerHTML = options.html || '';
        if (options.width) {
            node.style.width = options.width + 'px';
            node.style.height = (options.height || options.width) + 'px';
        }
        if (options.color) {
            node.style.color = options.color;
        }
        if (options.background) {
            node.style.background = options.background;
        }
        if (options.fontSize) {
            node.style.fontSize = options.fontSize + 'px';
        }
        gsap.set(node, { xPercent: -50, yPercent: -50, x: x, y: y, opacity: 0, scale: 1, rotation: 0, transformPerspective: 400 });
        return node;
    }

    // Run a timeline for a node and return the node to the pool when it ends
    function play(node, timeline) {
        node.fxTimeline = timeline;
        timeline.eventCallback('onComplete', function () {
            releaseNode(node);
        });
        return timeline;
    }

    /* ------------------------------------------------------------------
     * Effects
     * type 'ambient': spawned across the screen at `perSecond`, `prefill` visible at start
     * type 'trail':   spawned behind the mouse, `perPixel` of mouse travel
     * type 'click':   spawned where the user clicks or taps
     * ------------------------------------------------------------------ */
    var EFFECTS = {
        snow: {
            type: 'ambient',
            cap: 45,
            perSecond: 3,
            prefill: 18,
            spawn: function (x, y, isPrefill) {
                var size = random(7, 15);
                var node = createParticle(x, y, { html: SHAPES.snowflake, width: size, color: 'var(--fx-snow)' });
                if (!node) return;
                var life = random(8, 14) * (isPrefill ? random(0.4, 0.9) : 1);
                var fall = window.innerHeight + 40 - y;
                play(
                    node,
                    gsap
                        .timeline()
                        .to(node, { opacity: random(0.5, 0.9), duration: 1 }, 0)
                        .to(node, { y: y + fall, duration: life, ease: 'none' }, 0)
                        .to(node, { x: x + random(-70, 70), duration: life, ease: 'sine.inOut' }, 0)
                        .to(node, { rotation: random(-180, 180), duration: life, ease: 'none' }, 0)
                        .to(node, { opacity: 0, duration: 1.2 }, life - 1.2)
                );
            },
        },

        leaves: {
            type: 'ambient',
            cap: 18,
            perSecond: 0.8,
            prefill: 6,
            spawn: function (x, y, isPrefill) {
                var size = random(14, 22);
                var node = createParticle(x, y, { html: SHAPES.leaf, width: size, height: size * 1.2, color: pick(LEAF_COLORS) });
                if (!node) return;
                var life = random(9, 15) * (isPrefill ? random(0.4, 0.9) : 1);
                var fall = window.innerHeight + 50 - y;
                play(
                    node,
                    gsap
                        .timeline()
                        .to(node, { opacity: random(0.75, 0.95), duration: 1 }, 0)
                        .to(node, { y: y + fall, duration: life, ease: 'sine.in' }, 0)
                        .to(node, { x: x + random(-140, 180), duration: life, ease: 'sine.inOut' }, 0)
                        .to(node, { rotation: random(-420, 420), duration: life, ease: 'none' }, 0)
                        // Leaves rock back and forth as they fall
                        .to(node, { rotationX: 55, duration: random(0.9, 1.5), ease: 'sine.inOut', yoyo: true, repeat: Math.floor(life / 1.2) }, 0)
                        .to(node, { opacity: 0, duration: 1.5 }, life - 1.5)
                );
            },
        },

        fireflies: {
            type: 'ambient',
            cap: 20,
            perSecond: 1,
            prefill: 10,
            spawn: function (x, y) {
                var size = random(8, 14);
                var node = createParticle(x, y, { className: 'site-fx__glow', width: size });
                if (!node) return;
                var timeline = gsap.timeline();
                // Wander along a few random waypoints
                var wanderX = x;
                var wanderY = y;
                var time = 0;
                for (var i = 0; i < 4; i++) {
                    var step = random(1.8, 3);
                    wanderX += random(-90, 90);
                    wanderY += random(-70, 70);
                    timeline.to(node, { x: wanderX, y: wanderY, duration: step, ease: 'sine.inOut' }, time);
                    time += step;
                }
                // Glow on and off while wandering, then fade away
                timeline
                    .to(node, { opacity: random(0.7, 1), duration: random(0.8, 1.4), ease: 'sine.inOut', yoyo: true, repeat: Math.floor(time / 1.2) }, 0)
                    .to(node, { opacity: 0, duration: 0.8 }, time - 0.8);
                play(node, timeline);
            },
        },

        sparkles: {
            type: 'trail',
            cap: 40,
            perPixel: 0.05,
            spawn: function (x, y) {
                var size = random(7, 15);
                var node = createParticle(x + random(-12, 12), y + random(-12, 12), { html: SHAPES.star, width: size, color: pick(SPARKLE_COLORS) });
                if (!node) return;
                var life = random(0.7, 1.3);
                gsap.set(node, { scale: 0, rotation: random(-45, 45) });
                play(
                    node,
                    gsap
                        .timeline()
                        .to(node, { opacity: 1, scale: 1, duration: life * 0.35, ease: 'back.out(3)' }, 0)
                        .to(node, { y: '+=' + random(8, 24), rotation: '+=' + random(-90, 90), duration: life, ease: 'power1.out' }, 0)
                        .to(node, { opacity: 0, scale: 0.2, duration: life * 0.5, ease: 'power2.in' }, life * 0.5)
                );
            },
        },

        bubbles: {
            type: 'trail',
            cap: 30,
            perPixel: 0.02,
            spawn: function (x, y) {
                var size = random(8, 22);
                var node = createParticle(x + random(-8, 8), y + random(-8, 8), { className: 'site-fx__bubble', width: size });
                if (!node) return;
                var life = random(2, 3.4);
                gsap.set(node, { scale: 0.4 });
                play(
                    node,
                    gsap
                        .timeline()
                        .to(node, { opacity: random(0.7, 1), scale: 1, duration: 0.4, ease: 'power2.out' }, 0)
                        .to(node, { y: '-=' + random(90, 190), duration: life, ease: 'sine.out' }, 0)
                        .to(node, { x: '+=' + random(10, 22) * (Math.random() < 0.5 ? -1 : 1), duration: random(0.6, 1), ease: 'sine.inOut', yoyo: true, repeat: Math.floor(life / 0.8) }, 0)
                        // Pop
                        .to(node, { scale: 1.35, opacity: 0, duration: 0.18, ease: 'power2.out' }, life - 0.18)
                );
            },
        },

        'magic-dust': {
            type: 'trail',
            cap: 70,
            perPixel: 0.12,
            spawn: function (x, y) {
                var size = random(2.5, 5.5);
                var node = createParticle(x + random(-6, 6), y + random(-6, 6), { className: 'site-fx__dust', width: size });
                if (!node) return;
                var life = random(0.9, 1.6);
                play(
                    node,
                    gsap
                        .timeline()
                        .to(node, { opacity: random(0.7, 1), duration: 0.15 }, 0)
                        .to(node, { y: '+=' + random(30, 80), duration: life, ease: 'power1.in' }, 0)
                        .to(node, { x: '+=' + random(-22, 22), duration: life, ease: 'sine.out' }, 0)
                        .to(node, { opacity: 0, scale: 0.3, duration: life * 0.5 }, life * 0.5)
                );
            },
        },

        hearts: {
            type: 'trail',
            cap: 24,
            perPixel: 0.018,
            spawn: function (x, y) {
                var size = random(10, 18);
                var node = createParticle(x + random(-8, 8), y + random(-8, 8), { html: SHAPES.heart, width: size, height: size * 0.85, color: pick(HEART_COLORS) });
                if (!node) return;
                var life = random(1.6, 2.6);
                gsap.set(node, { scale: 0.3, rotation: random(-20, 20) });
                play(
                    node,
                    gsap
                        .timeline()
                        .to(node, { opacity: random(0.8, 1), scale: 1, duration: 0.35, ease: 'back.out(2.5)' }, 0)
                        .to(node, { y: '-=' + random(60, 120), duration: life, ease: 'power1.out' }, 0)
                        .to(node, { x: '+=' + random(6, 14) * (Math.random() < 0.5 ? -1 : 1), duration: random(0.5, 0.8), ease: 'sine.inOut', yoyo: true, repeat: Math.floor(life / 0.65) }, 0)
                        .to(node, { opacity: 0, duration: life * 0.4 }, life * 0.6)
                );
            },
        },

        code: {
            type: 'trail',
            cap: 26,
            perPixel: 0.02,
            spawn: function (x, y) {
                var node = createParticle(x + random(-10, 10), y + random(-10, 10), {
                    html: pick(CODE_GLYPHS).replace(/</g, '&lt;').replace(/>/g, '&gt;'),
                    className: 'site-fx__code',
                    color: pick(CODE_COLORS),
                    fontSize: random(11, 16),
                });
                if (!node) return;
                var life = random(1.4, 2.4);
                play(
                    node,
                    gsap
                        .timeline()
                        .to(node, { opacity: random(0.75, 1), duration: 0.25 }, 0)
                        .to(node, { y: '-=' + random(40, 90), x: '+=' + random(-25, 25), rotation: random(-25, 25), duration: life, ease: 'power1.out' }, 0)
                        .to(node, { opacity: 0, duration: life * 0.45 }, life * 0.55)
                );
            },
        },

        confetti: {
            type: 'click',
            cap: 80,
            perClick: 26,
            spawn: function (x, y) {
                var width = random(5, 9);
                var node = createParticle(x, y, {
                    className: 'site-fx__confetti',
                    width: width,
                    height: width * random(1.3, 1.9),
                    background: pick(CONFETTI_COLORS),
                });
                if (!node) return;
                // Mostly upward, spreading to both sides
                var angle = random(-Math.PI * 0.95, -Math.PI * 0.05);
                var distance = random(60, 170);
                var riseX = Math.cos(angle) * distance;
                var riseY = Math.sin(angle) * distance;
                var life = random(1.6, 2.4);
                gsap.set(node, { rotation: random(0, 360) });
                play(
                    node,
                    gsap
                        .timeline()
                        .to(node, { opacity: 1, duration: 0.05 }, 0)
                        .to(node, { x: x + riseX * 1.3, duration: life, ease: 'power2.out' }, 0)
                        .to(node, { y: y + riseY, duration: life * 0.3, ease: 'power2.out' }, 0)
                        .to(node, { y: y + riseY + random(120, 220), duration: life * 0.7, ease: 'power1.in' }, life * 0.3)
                        .to(node, { rotation: '+=' + random(-540, 540), rotationX: '+=' + random(360, 900), duration: life, ease: 'none' }, 0)
                        .to(node, { opacity: 0, duration: life * 0.3 }, life * 0.7)
                );
            },
        },

        ripple: {
            type: 'click',
            cap: 12,
            perClick: 2,
            spawn: function (x, y, index) {
                var node = createParticle(x, y, { className: 'site-fx__ring', width: 44 });
                if (!node) return;
                gsap.set(node, { scale: 0.15 });
                play(
                    node,
                    gsap
                        .timeline({ delay: index * 0.12 })
                        .to(node, { opacity: 0.6, duration: 0.05 }, 0)
                        .to(node, { scale: index ? 2.2 : 1.6, duration: 0.75, ease: 'power2.out' }, 0)
                        .to(node, { opacity: 0, duration: 0.6, ease: 'power1.in' }, 0.15)
                );
            },
        },
    };

    /* ------------------------------------------------------------------
     * Mouse trail engine (shared by every 'trail' effect)
     * ------------------------------------------------------------------ */
    var IGNORE_SELECTOR = 'input, textarea, select, [contenteditable="true"], .monaco-editor, [data-effects-off]';
    var current = null;
    var currentName = null;
    var emitter = { x: 0, y: 0 };
    var moveEmitterX = null;
    var moveEmitterY = null;
    var lastX = 0;
    var lastY = 0;
    var lastTime = 0;
    var lastMoveTime = 0;
    var velocityX = 0;
    var velocityY = 0;
    var spawnBudget = 0;
    var hasPointer = false;
    var isOverIgnored = false;
    var isTicking = false;
    var ambientCall = null;

    function onMouseMove(event) {
        var now = performance.now();
        if (!hasPointer) {
            hasPointer = true;
            lastX = event.clientX;
            lastY = event.clientY;
            lastTime = now;
            gsap.set(emitter, { x: event.clientX, y: event.clientY });
        }

        var deltaTime = Math.max(now - lastTime, 8);
        velocityX += ((event.clientX - lastX) / deltaTime - velocityX) * 0.35;
        velocityY += ((event.clientY - lastY) / deltaTime - velocityY) * 0.35;
        lastX = event.clientX;
        lastY = event.clientY;
        lastTime = lastMoveTime = now;

        moveEmitterX(event.clientX);
        moveEmitterY(event.clientY);

        var target = event.target;
        isOverIgnored = !!(target && target.closest && target.closest(IGNORE_SELECTOR));

        if (!isTicking) {
            isTicking = true;
            gsap.ticker.add(onTrailTick);
        }
    }

    function onTrailTick() {
        var idleTime = performance.now() - lastMoveTime;
        if (idleTime > 60) {
            velocityX *= 0.8;
            velocityY *= 0.8;
        }
        var velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

        if (idleTime > 300 && velocity < 0.02) {
            isTicking = false;
            spawnBudget = 0;
            gsap.ticker.remove(onTrailTick);
            return;
        }
        if (isOverIgnored || document.hidden) {
            spawnBudget = 0;
            return;
        }

        var frameMs = gsap.ticker.deltaRatio() * (1000 / 60);
        spawnBudget += velocity * frameMs * current.perPixel;
        var count = Math.min(Math.floor(spawnBudget), 4);
        spawnBudget = Math.min(spawnBudget - count, 1);

        for (var i = 0; i < count; i++) {
            current.spawn(emitter.x, emitter.y);
        }
    }

    /* ------------------------------------------------------------------
     * Background (ambient) and click engines
     * ------------------------------------------------------------------ */
    function ambientPosition(isPrefill) {
        var x = random(-20, window.innerWidth + 20);
        // Falling effects enter from the top; fireflies appear anywhere
        var y = isPrefill || currentName === 'fireflies' ? random(0, window.innerHeight) : -30;
        return { x: x, y: y };
    }

    function scheduleAmbient() {
        var perSecond = current.perSecond * (finePointerQuery.matches ? 1 : 0.5); // lighter on phones
        ambientCall = gsap.delayedCall(random(0.6, 1.4) / perSecond, function () {
            if (!document.hidden) {
                var position = ambientPosition(false);
                current.spawn(position.x, position.y, false);
            }
            scheduleAmbient();
        });
    }

    function onPointerDown(event) {
        if (event.button !== undefined && event.button !== 0) {
            return;
        }
        for (var i = 0; i < current.perClick; i++) {
            current.spawn(event.clientX, event.clientY, i);
        }
    }

    /* ------------------------------------------------------------------
     * Lifecycle
     * ------------------------------------------------------------------ */
    function stop() {
        if (!current) {
            return;
        }
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('pointerdown', onPointerDown);
        if (isTicking) {
            gsap.ticker.remove(onTrailTick);
            isTicking = false;
        }
        if (ambientCall) {
            ambientCall.kill();
            ambientCall = null;
        }
        allNodes.forEach(function (node) {
            // Kill the whole timeline so its onComplete never fires after the switch
            if (node.fxTimeline) {
                node.fxTimeline.kill();
                node.fxTimeline = null;
            }
            gsap.killTweensOf(node);
        });
        gsap.killTweensOf(emitter);
        if (layer) {
            layer.remove();
        }
        layer = null;
        allNodes = [];
        freeNodes = [];
        current = null;
        currentName = null;
        hasPointer = false;
        velocityX = velocityY = spawnBudget = 0;
    }

    function start(name) {
        stop();
        var effect = EFFECTS[name];
        if (!effect || typeof window.gsap === 'undefined' || reducedMotionQuery.matches) {
            return false;
        }
        if (effect.type === 'trail' && !finePointerQuery.matches) {
            return false; // mouse trails need a mouse
        }

        current = effect;
        currentName = name;
        nodeCap = effect.cap;

        layer = document.createElement('div');
        layer.className = 'site-fx site-fx--' + name;
        layer.setAttribute('aria-hidden', 'true');
        document.body.appendChild(layer);

        if (effect.type === 'trail') {
            moveEmitterX = gsap.quickTo(emitter, 'x', { duration: 0.2, ease: 'power3' });
            moveEmitterY = gsap.quickTo(emitter, 'y', { duration: 0.2, ease: 'power3' });
            window.addEventListener('mousemove', onMouseMove, { passive: true });
        } else if (effect.type === 'ambient') {
            var prefill = Math.round(effect.prefill * (finePointerQuery.matches ? 1 : 0.5));
            for (var i = 0; i < prefill; i++) {
                var position = ambientPosition(true);
                effect.spawn(position.x, position.y, true);
            }
            scheduleAmbient();
        } else if (effect.type === 'click') {
            window.addEventListener('pointerdown', onPointerDown, { passive: true });
        }
        return true;
    }

    // Follow OS settings live: turning on "reduce motion" stops the effect, turning it off restarts it
    var requestedName = null;
    function onEnvironmentChange() {
        if (requestedName) {
            start(requestedName);
        }
    }
    [reducedMotionQuery, finePointerQuery].forEach(function (query) {
        if (query.addEventListener) {
            query.addEventListener('change', onEnvironmentChange);
        } else if (query.addListener) {
            query.addListener(onEnvironmentChange);
        }
    });

    window.SiteEffects = {
        list: Object.keys(EFFECTS),
        start: function (name) {
            requestedName = name;
            return start(name);
        },
        stop: function () {
            requestedName = null;
            stop();
        },
        get current() {
            return currentName;
        },
    };

    function autoStart() {
        if (window.SITE_EFFECT) {
            window.SiteEffects.start(window.SITE_EFFECT);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoStart);
    } else {
        autoStart();
    }
})(window, document);
