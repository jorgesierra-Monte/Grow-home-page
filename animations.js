/* ─── Animations ─────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. Hero image load animation (GSAP stagger) ────────────────────────── */
  const heroImages = document.querySelectorAll('.hero-image');

  // gsap.from() handles the initial hidden state — no gsap.set() needed,
  // which avoids the CSS-transition conflict that was blocking some images.
  gsap.from(heroImages, {
    opacity: 0,
    scale: 0.88,
    y: 14,
    duration: 0.9,
    stagger: 0.14,          // longer gap → images pop in one by one
    ease: 'back.out(1.4)',  // soft overshoot on scale — settles in naturally
    clearProps: 'all',      // clean up inline styles so parallax takes over cleanly
    onComplete: enableCursorParallax,
  });


  /* ── 2. Hero text fade in (slightly after images start) ─────────────────── */
  const heroLockup = document.querySelector('.hero-lockup');
  if (heroLockup) {
    gsap.set(heroLockup, { opacity: 0, y: 16 });
    gsap.to(heroLockup, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      delay: 0.4,
      ease: 'power2.out',
    });
  }


  /* ── 3. Cursor parallax (activates after load animation) ────────────────── */
  let parallaxEnabled = false;

  function enableCursorParallax() {
    parallaxEnabled = true;
  }

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', (e) => {
    if (!parallaxEnabled) return;

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    targetX = (e.clientX - cx) / cx;   // -1 to 1
    targetY = (e.clientY - cy) / cy;   // -1 to 1
  });

  // Smooth lerp loop for the parallax
  (function loop() {
    if (parallaxEnabled) {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      heroImages.forEach(img => {
        const depth = parseFloat(img.dataset.depth) || 0.5;
        const maxPx = 10;
        const tx = currentX * maxPx * depth;
        const ty = currentY * maxPx * depth;
        img.style.transform = `translate(${tx}px, ${ty}px)`;
      });
    }
    requestAnimationFrame(loop);
  })();


  /* ── 4. Scroll-triggered text animations (IntersectionObserver) ─────────── */
  const scrollEls = document.querySelectorAll('.scroll-animate');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  scrollEls.forEach(el => observer.observe(el));


  /* ── 5. FAQ accordion ────────────────────────────────────────────────────── */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // close all
      faqItems.forEach(i => i.classList.remove('open'));
      // open clicked if it was closed
      if (!isOpen) item.classList.add('open');
    });
  });


  /* ── 6. Provider carousel controls ──────────────────────────────────────── */
  document.querySelectorAll('.carousel-section').forEach(section => {
    const track = section.querySelector('.carousel-track');
    const prevBtn = section.querySelector('.carousel-prev');
    const nextBtn = section.querySelector('.carousel-next');
    if (!track || !prevBtn || !nextBtn) return;

    const cardWidth = 280 + 24; // card + gap
    let offset = 0;
    const maxOffset = () => {
      const cards = track.querySelectorAll('.provider-card').length;
      return Math.max(0, (cards - 5) * cardWidth);
    };

    function update() {
      track.style.transform = `translateX(-${offset}px)`;
      prevBtn.classList.toggle('disabled', offset === 0);
      nextBtn.classList.toggle('disabled', offset >= maxOffset());
    }

    prevBtn.addEventListener('click', () => {
      offset = Math.max(0, offset - cardWidth);
      update();
    });
    nextBtn.addEventListener('click', () => {
      offset = Math.min(maxOffset(), offset + cardWidth);
      update();
    });
    update();
  });


  /* ── 7. Sticky filter bar ────────────────────────────────────────────────── */
  const stickyBar   = document.getElementById('stickyFilters');
  const originBar   = document.querySelector('.hero-lockup .hero-filter-bar');
  let   stickyShown = false;

  function getStickyTrigger() {
    // Y position in the document where the filter bar's top edge hits 24px from viewport top
    return originBar.getBoundingClientRect().top + window.scrollY - 24;
  }

  window.addEventListener('scroll', () => {
    const scrollY   = window.scrollY;
    const threshold = getStickyTrigger();

    if (scrollY >= threshold && !stickyShown) {
      stickyShown = true;
      stickyBar.classList.remove('is-receding');
      stickyBar.classList.add('is-visible');
    } else if (scrollY < threshold && stickyShown) {
      stickyShown = false;
      stickyBar.classList.remove('is-visible');
      stickyBar.classList.add('is-receding');
    }
  }, { passive: true });

});
