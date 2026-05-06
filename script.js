

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

/* ── LANGUAGE TOGGLE ── */
window.toggleLang = function () {
    const body = document.body;
    const isAr = body.classList.toggle('lang-ar');
    const label = document.getElementById('langLabel');
    if (label) label.textContent = isAr ? 'English' : 'عربي';

    const t = isAr ? translations.ar : translations.en;

    // Nav links
    document.querySelectorAll('.nav-link').forEach(function(el) {
        const key = el.getAttribute('href').replace('#','').toLowerCase().replace('-','_');
        if (t.nav[key]) el.textContent = t.nav[key];
    });
    document.querySelectorAll('.mobile-link').forEach(function(el) {
        const key = el.getAttribute('href').replace('#','').toLowerCase().replace('-','_');
        if (t.nav[key]) el.textContent = t.nav[key];
    });

    // Hero
    const heroBadge = document.querySelector('.hero-badge');
    if (heroBadge) heroBadge.innerHTML = '<span class="badge-dot"></span>' + t.hero.badge;

    const heroLines = document.querySelectorAll('.hero-line');
    if (heroLines[0]) heroLines[0].textContent = t.hero.line1;
    if (heroLines[1]) heroLines[1].textContent = t.hero.line2;
    if (heroLines[2]) heroLines[2].textContent = t.hero.line3;

    const heroSub = document.querySelector('.hero-sub');
    if (heroSub) heroSub.innerHTML = t.hero.sub;

    const heroBtns = document.querySelectorAll('.hero-actions a');
    if (heroBtns[0]) heroBtns[0].innerHTML = '<span>' + t.hero.btn1 + '</span><i class="fas fa-arrow-right"></i>';
    if (heroBtns[1]) heroBtns[1].textContent = t.hero.btn2;

    const statLabels = document.querySelectorAll('.stat-label');
    const sLabels = t.hero.stats;
    statLabels.forEach(function(el, i) { if (sLabels[i]) el.textContent = sLabels[i]; });

    // Sections headers
    document.querySelectorAll('.section-tag').forEach(function(el, i) {
        if (t.sections.tags[i]) el.textContent = t.sections.tags[i];
    });
    document.querySelectorAll('.section-title').forEach(function(el, i) {
        if (t.sections.titles[i]) el.textContent = t.sections.titles[i];
    });
    document.querySelectorAll('.section-sub').forEach(function(el, i) {
        if (t.sections.subs[i]) el.innerHTML = t.sections.subs[i];
    });

    // Products
    const products = document.querySelectorAll('.product-card');
    products.forEach(function(card, i) {
        const p = t.products[i];
        if (!p) return;
        card.querySelector('h3').textContent = p.title;
        card.querySelector('p').textContent = p.desc;
        card.querySelector('.product-link').innerHTML = p.link + ' <i class="fas fa-arrow-right"></i>';
    });

    // Header CTA
    const headerCta = document.querySelector('.header-cta');
    if (headerCta) headerCta.innerHTML = '<i class="fab fa-whatsapp"></i> ' + t.headerCta;

    // Marquee label
    const marqueeLabel = document.querySelector('.marquee-label');
    if (marqueeLabel) marqueeLabel.textContent = t.marqueeLabel;

    // Price search placeholder
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.placeholder = t.searchPlaceholder;

    // About section
    const aboutSub = document.querySelector('.about-sub');
    if (aboutSub) aboutSub.textContent = t.about.sub;
    const aboutPs = document.querySelectorAll('.about-text-col > p');
    if (aboutPs[0]) aboutPs[0].textContent = t.about.p1;
    if (aboutPs[1]) aboutPs[1].textContent = t.about.p2;

    const featureTitles = document.querySelectorAll('.feature-item strong');
    const featureDescs = document.querySelectorAll('.feature-item p');
    t.about.features.forEach(function(f, i) {
        if (featureTitles[i]) featureTitles[i].textContent = f.title;
        if (featureDescs[i]) featureDescs[i].textContent = f.desc;
    });

    // Contact
    const formTitle = document.querySelector('.form-title');
    if (formTitle) formTitle.textContent = t.form.title;
    const formLabels = document.querySelectorAll('.form-group label');
    const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
    t.form.fields.forEach(function(f, i) {
        if (formLabels[i]) formLabels[i].textContent = f.label;
        if (formInputs[i]) formInputs[i].placeholder = f.placeholder;
    });
    const submitBtn = document.querySelector('.form-submit span');
    if (submitBtn) submitBtn.textContent = t.form.submit;

    // Footer
    const footerBrandP = document.querySelector('.footer-brand p');
    if (footerBrandP) footerBrandP.textContent = t.footer.tagline;
    const footerLinks = document.querySelectorAll('.footer-links a');
    t.footer.links.forEach(function(l, i) { if (footerLinks[i]) footerLinks[i].textContent = l; });
    const footerCopys = document.querySelectorAll('.footer-copy p');
    if (footerCopys[0]) footerCopys[0].textContent = t.footer.copy;

    // RTL/LTR direction fix on html tag
    document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', isAr ? 'ar' : 'en');
};

var translations = {
    en: {
        nav: { products: 'Products', price_list: 'Price List', about: 'About', contact: 'Contact' },
        headerCta: 'Get a Quote',
        marqueeLabel: 'Trusted Brands',
        searchPlaceholder: 'Search brands...',
        hero: {
            badge: 'Premium Packaging Solutions · Since 2018',
            line1: 'Packaging', line2: 'That Protects', line3: 'Your Brand',
            sub: "Egypt's trusted supplier for food & hospitality packaging.<br>Quality products, competitive prices, fast delivery.",
            btn1: 'Explore Products', btn2: 'View Price Lists',
            stats: ['Brands', 'Years', 'Clients']
        },
        sections: {
            tags: ['What We Offer', 'Always Updated', 'Our Story', 'Reach Out'],
            titles: ['Our Products', 'Price Lists', 'About Us', 'Contact Us'],
            subs: [
                'High-quality packaging solutions for every business need',
                'Click any brand to view its latest price list in PDF format',
                '',
                "We're always ready to help — choose your preferred channel"
            ]
        },
        products: [
            { title: 'Paper Cups', desc: 'High quality paper cups for hot and cold drinks with custom printing options available.', link: 'Get Pricing' },
            { title: 'Food Containers', desc: 'Eco-friendly foam and plastic containers designed for restaurants and food businesses.', link: 'Get Pricing' },
            { title: 'Cutlery Sets', desc: 'Disposable forks, spoons, and knives for high-end hospitality and catering services.', link: 'Get Pricing' },
            { title: 'Plastic Packaging', desc: 'Stretch film, bags, and plastic wrap solutions for industrial and commercial use.', link: 'Get Pricing' },
            { title: 'Foam Products', desc: 'Lightweight and insulating foam trays and containers for food preservation.', link: 'Get Pricing' },
            { title: 'Custom Printing', desc: 'Brand your packaging with custom logos and designs to stand out in the market.', link: 'Get Pricing' }
        ],
        about: {
            sub: 'من نحن',
            p1: 'Rayan Pack — Our journey began in 2018. We believe that packaging quality is the first step to any product\'s success. With years of experience, we strive to provide innovative and practical solutions.',
            p2: 'We offer a diverse range of packaging products characterized by high quality using safe materials, modern designs, and customized solutions for various sectors.',
            features: [
                { title: 'Premium Quality', desc: 'Safe, certified materials' },
                { title: 'Fast Delivery', desc: 'On-time, every time' },
                { title: 'Best Prices', desc: 'Competitive market rates' },
                { title: '24/7 Support', desc: 'Always here for you' }
            ]
        },
        form: {
            title: 'Inquiries & Complaints',
            fields: [
                { label: 'Name', placeholder: 'Your full name' },
                { label: 'Email', placeholder: 'email@example.com' },
                { label: 'Phone', placeholder: '+20 1XX XXX XXXX' },
                { label: 'Message', placeholder: 'Write your message here...' }
            ],
            submit: 'Send Message'
        },
        footer: {
            tagline: 'Premium Packaging Solutions for Food & Hospitality',
            links: ['Products', 'Price List', 'About', 'Contact'],
            copy: '© 2025 EL Rayan Pack — All rights reserved'
        }
    },
    ar: {
        nav: { products: 'المنتجات', price_list: 'قائمة الأسعار', about: 'من نحن', contact: 'تواصل معنا' },
        headerCta: 'احصل على عرض سعر',
        marqueeLabel: 'علاماتنا التجارية',
        searchPlaceholder: 'ابحث عن ماركة...',
        hero: {
            badge: 'حلول تعبئة وتغليف متميزة · منذ 2018',
            line1: 'تغليف', line2: 'يحمي علامتك', line3: 'التجارية',
            sub: 'الموزع الموثوق في مصر لتغليف الأغذية والضيافة.<br>منتجات عالية الجودة، أسعار تنافسية، توصيل سريع.',
            btn1: 'استعرض المنتجات', btn2: 'عرض قوائم الأسعار',
            stats: ['ماركة', 'سنوات', 'عميل']
        },
        sections: {
            tags: ['ما نقدمه', 'محدّثة دائمًا', 'قصتنا', 'تواصل معنا'],
            titles: ['منتجاتنا', 'قوائم الأسعار', 'من نحن', 'اتصل بنا'],
            subs: [
                'حلول تغليف عالية الجودة لكل احتياجات عملك',
                'اضغط على أي ماركة لعرض آخر قائمة أسعار بصيغة PDF',
                '',
                'نحن دائمًا مستعدون للمساعدة — اختر قناة التواصل المفضلة لديك'
            ]
        },
        products: [
            { title: 'أكواب ورقية', desc: 'أكواب ورقية عالية الجودة للمشروبات الساخنة والباردة مع خيارات طباعة مخصصة.', link: 'احصل على السعر' },
            { title: 'عبوات غذائية', desc: 'عبوات فوم وبلاستيك صديقة للبيئة مصممة للمطاعم ومشاريع الأغذية.', link: 'احصل على السعر' },
            { title: 'أدوات مائدة', desc: 'شوك وملاعق وسكاكين للاستخدام مرة واحدة لخدمات الضيافة والتموين الراقية.', link: 'احصل على السعر' },
            { title: 'تغليف بلاستيكي', desc: 'أفلام تمديد وأكياس وحلول تغليف بلاستيكية للاستخدام الصناعي والتجاري.', link: 'احصل على السعر' },
            { title: 'منتجات فوم', desc: 'صواني وعبوات فوم خفيفة الوزن وعازلة للحفاظ على الأغذية.', link: 'احصل على السعر' },
            { title: 'طباعة مخصصة', desc: 'ضع علامتك التجارية على تغليفك بشعارات وتصاميم مخصصة لتتميز في السوق.', link: 'احصل على السعر' }
        ],
        about: {
            sub: 'من نحن',
            p1: 'ريان للتعبئة والتغليف — بدأت رحلتنا في عام 2018. نؤمن أن جودة التغليف هي الخطوة الأولى لنجاح أي منتج. بخبرة تمتد لسنوات، نسعى لتقديم حلول مبتكرة وعملية تواكب احتياجات السوق.',
            p2: 'نقدّم مجموعة متنوعة من منتجات التغليف التي تتميز بجودة عالية باستخدام خامات آمنة، وتصاميم عصرية تبرز هوية المنتج، وحلول مخصصة لمختلف القطاعات.',
            features: [
                { title: 'جودة عالية', desc: 'مواد آمنة ومعتمدة' },
                { title: 'توصيل سريع', desc: 'في الوقت المحدد دائمًا' },
                { title: 'أفضل الأسعار', desc: 'أسعار تنافسية في السوق' },
                { title: 'دعم 24/7', desc: 'دائمًا في خدمتك' }
            ]
        },
        form: {
            title: 'للاستفسارات والشكاوى',
            fields: [
                { label: 'الاسم', placeholder: 'اسمك الكامل' },
                { label: 'البريد الإلكتروني', placeholder: 'email@example.com' },
                { label: 'رقم الهاتف', placeholder: '+20 1XX XXX XXXX' },
                { label: 'رسالتك', placeholder: 'اكتب رسالتك هنا...' }
            ],
            submit: 'إرسال الرسالة'
        },
        footer: {
            tagline: 'حلول تعبئة وتغليف متميزة للأغذية والضيافة',
            links: ['المنتجات', 'قائمة الأسعار', 'من نحن', 'تواصل'],
            copy: '© 2025 ريان باك — جميع الحقوق محفوظة'
        }
    }
};
