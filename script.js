/* ══════════════════════════════════
   EL RAYAN PACK — script.js
══════════════════════════════════ */

(function () {
    'use strict';

    /* ── PRELOADER ── */
    window.addEventListener('load', function () {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;
        setTimeout(function () {
            preloader.classList.add('hidden');
        }, 1800);
    });

    /* ── CUSTOM CURSOR ── */
    (function initCursor() {
        const cursor = document.getElementById('cursor');
        const follower = document.getElementById('cursor-follower');
        if (!cursor || !follower) return;
        if (window.matchMedia('(hover: none)').matches) return;

        let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

        document.addEventListener('mousemove', function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });

        function animateFollower() {
            followerX += (mouseX - followerX) * 0.12;
            followerY += (mouseY - followerY) * 0.12;
            follower.style.left = followerX + 'px';
            follower.style.top = followerY + 'px';
            requestAnimationFrame(animateFollower);
        }
        animateFollower();

        const hoverTargets = 'a, button, .price-card, .product-card, input, textarea';
        document.querySelectorAll(hoverTargets).forEach(function (el) {
            el.addEventListener('mouseenter', function () { document.body.classList.add('cursor-hover'); });
            el.addEventListener('mouseleave', function () { document.body.classList.remove('cursor-hover'); });
        });
    })();

    /* ── HEADER SCROLL ── */
    (function initHeader() {
        const header = document.getElementById('header');
        if (!header) return;
        function onScroll() {
            header.classList.toggle('scrolled', window.scrollY > 40);
        }
        window.addEventListener('scroll', onScroll, { passive: true });
    })();

    /* ── HAMBURGER / MOBILE MENU ── */
    (function initMobileMenu() {
        const btn = document.getElementById('hamburger');
        const menu = document.getElementById('mobile-menu');
        if (!btn || !menu) return;

        btn.addEventListener('click', function () {
            const open = menu.classList.toggle('open');
            btn.classList.toggle('open', open);
            btn.setAttribute('aria-expanded', open);
        });

        menu.querySelectorAll('.mobile-link').forEach(function (link) {
            link.addEventListener('click', function () {
                menu.classList.remove('open');
                btn.classList.remove('open');
            });
        });
    })();

    /* ── ACTIVE NAV LINK ON SCROLL ── */
    (function initActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        if (!sections.length || !navLinks.length) return;

        function setActive() {
            let current = '';
            sections.forEach(function (sec) {
                if (window.scrollY >= sec.offsetTop - 120) {
                    current = sec.id;
                }
            });
            navLinks.forEach(function (link) {
                const href = link.getAttribute('href').replace('#', '');
                link.style.color = href === current ? 'var(--blue)' : '';
            });
        }
        window.addEventListener('scroll', setActive, { passive: true });
    })();

    /* ── COUNTER ANIMATION ── */
    (function initCounters() {
        const counters = document.querySelectorAll('.stat-num[data-target]');
        if (!counters.length) return;

        let started = false;

        function animateCounter(el) {
            const target = parseInt(el.dataset.target, 10);
            const duration = 1800;
            const start = performance.now();

            function step(now) {
                const progress = Math.min((now - start) / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.floor(ease * target);
                if (progress < 1) requestAnimationFrame(step);
                else el.textContent = target;
            }
            requestAnimationFrame(step);
        }

        function startCounters() {
            if (started) return;
            const hero = document.querySelector('.hero-stats');
            if (!hero) return;
            const rect = hero.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.9) {
                started = true;
                counters.forEach(animateCounter);
            }
        }

        window.addEventListener('scroll', startCounters, { passive: true });
        setTimeout(startCounters, 1200); // trigger if hero already visible
    })();

    /* ── SCROLL REVEAL ── */
    (function initScrollReveal() {
        const revealEls = document.querySelectorAll('[data-reveal]');
        const productCards = document.querySelectorAll('.product-card');

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(function () {
                        entry.target.classList.add('revealed', 'visible');
                    }, parseInt(delay, 10));
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        revealEls.forEach(function (el) { observer.observe(el); });

        productCards.forEach(function (card, i) {
            card.style.transitionDelay = (i * 80) + 'ms';
            observer.observe(card);
        });
    })();

    /* ── PRICE LIST SEARCH ── */
    (function initSearch() {
        const input = document.getElementById('searchInput');
        const cards = document.querySelectorAll('.price-card');
        const countEl = document.getElementById('visibleCount');
        const noResults = document.getElementById('noResults');
        if (!input) return;

        // count only real brands (not coming soon)
        const realCount = document.querySelectorAll('.price-card:not(.coming-soon)').length;
        if (countEl) countEl.textContent = realCount;

        input.addEventListener('input', function () {
            const query = input.value.trim().toLowerCase();
            let visible = 0;

            cards.forEach(function (card) {
                const name = (card.dataset.name || '').toLowerCase();
                const match = !query || name.includes(query);
                card.classList.toggle('hidden', !match);
                if (match && !card.classList.contains('coming-soon')) visible++;
            });

            if (countEl) countEl.textContent = visible || (query ? 0 : realCount);
            if (noResults) noResults.style.display = (visible === 0 && query) ? 'block' : 'none';
        });
    })();

    /* ── CONTACT FORM ── */
    (function initForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', async function (e) {
            const submitBtn = form.querySelector('.form-submit');
            const successEl = document.getElementById('formSuccess');

            // Show loading state
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>جاري الإرسال...</span> <i class="fas fa-spinner fa-spin"></i>';
            }

            // If using Formspree, let the default POST happen.
            // But we add a success UI after a small delay for UX.
            if (form.action && form.action.includes('formspree')) {
                // Allow native submission; show feedback via fetch instead
                e.preventDefault();

                try {
                    const data = new FormData(form);
                    const res = await fetch(form.action, {
                        method: 'POST',
                        body: data,
                        headers: { 'Accept': 'application/json' }
                    });

                    if (res.ok) {
                        form.reset();
                        if (successEl) successEl.style.display = 'flex';
                        if (submitBtn) {
                            submitBtn.innerHTML = '<span>إرسال الرسالة</span> <i class="fas fa-paper-plane"></i>';
                            submitBtn.disabled = false;
                        }
                        setTimeout(function () {
                            if (successEl) successEl.style.display = 'none';
                        }, 5000);
                    } else {
                        throw new Error('Server error');
                    }
                } catch (err) {
                    alert('حدث خطأ، يرجى المحاولة مرة أخرى أو التواصل عبر واتساب.');
                    if (submitBtn) {
                        submitBtn.innerHTML = '<span>إرسال الرسالة</span> <i class="fas fa-paper-plane"></i>';
                        submitBtn.disabled = false;
                    }
                }
            }
        });
    })();

    /* ── BACK TO TOP ── */
    (function initBackToTop() {
        const btn = document.getElementById('backToTop');
        if (!btn) return;

        window.addEventListener('scroll', function () {
            btn.classList.toggle('visible', window.scrollY > 500);
        }, { passive: true });

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    })();

    /* ── SMOOTH SCROLL FOR ANCHOR LINKS ── */
    (function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener('click', function (e) {
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    })();

    /* ── MARQUEE PAUSE ON HOVER ── */
    (function initMarquee() {
        const track = document.getElementById('track');
        if (!track) return;
        track.addEventListener('mouseenter', function () { track.style.animationPlayState = 'paused'; });
        track.addEventListener('mouseleave', function () { track.style.animationPlayState = 'running'; });
    })();

    /* ── WHATSAPP FLOAT HIDE ON FORM AREA ── */
    (function initWaFloat() {
        const wa = document.getElementById('waFloat');
        const form = document.querySelector('.form-section');
        if (!wa || !form) return;

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                wa.style.opacity = entry.isIntersecting ? '0.4' : '1';
            });
        }, { threshold: 0.5 });

        observer.observe(form);
    })();

    /* ── SECTION FADE-IN (About, Contact, Footer) ── */
    (function initSectionReveal() {
        const sections = document.querySelectorAll('.about-section, .contact-section, .price-section, .products-section');
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'none';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.07 });

        sections.forEach(function (sec) {
            sec.style.opacity = '0';
            sec.style.transform = 'translateY(24px)';
            sec.style.transition = 'opacity .7s ease, transform .7s ease';
            observer.observe(sec);
        });
    })();

})();