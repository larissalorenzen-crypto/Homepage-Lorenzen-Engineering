(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ===== Scroll-triggered fade-in via IntersectionObserver =====
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('visible'));
  }

  // ===== Navbar background on scroll =====
  const header = $('#siteHeader');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      if (window.scrollY > 50) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ===== Mobile nav toggle =====
  const toggle = $('.nav-toggle');
  const mobileNav = $('#mobileNav');
  if (toggle && mobileNav) {
    const closeNav = () => {
      toggle.setAttribute('aria-expanded', 'false');
      mobileNav.hidden = true;
      document.body.style.overflow = '';
    };
    const openNav = () => {
      toggle.setAttribute('aria-expanded', 'true');
      mobileNav.hidden = false;
      document.body.style.overflow = 'hidden';
    };
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      expanded ? closeNav() : openNav();
    });
    $$('a', mobileNav).forEach((a) => a.addEventListener('click', closeNav));
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeNav();
    });
    const mq = window.matchMedia('(min-width: 1024px)');
    mq.addEventListener?.('change', (ev) => { if (ev.matches) closeNav(); });
  }

  // ===== Hero parallax (disabled on reduced motion and small screens) =====
  const mReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mDesktop = window.matchMedia('(min-width: 768px)');
  const parallaxEl = $('.hero-portrait[data-parallax]');
  if (parallaxEl && !mReduced.matches) {
    const strength = parseFloat(parallaxEl.getAttribute('data-parallax')) || 0.05;
    let raf = 0;
    const update = () => {
      raf = 0;
      if (!mDesktop.matches) { parallaxEl.style.transform = ''; return; }
      const y = window.scrollY;
      parallaxEl.style.transform = `translate3d(0, ${-y * strength}px, 0)`;
    };
    window.addEventListener('scroll', () => {
      if (!raf) raf = requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  // ===== Smooth scroll for anchor links (accounts for fixed header) =====
  const headerH = () => (header ? header.getBoundingClientRect().height : 64);
  $$('a[href^="#"]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href === '#' || href.length < 2) return;
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - headerH() - 12;
      window.scrollTo({ top: y, behavior: mReduced.matches ? 'auto' : 'smooth' });
      history.pushState(null, '', href);
    });
  });

  // ===== Accordion: ensure only one open at a time in footer =====
  const accordions = $$('.site-footer .accordion');
  accordions.forEach((d) => {
    d.addEventListener('toggle', () => {
      if (d.open) {
        accordions.forEach((o) => { if (o !== d && o.open) o.open = false; });
      }
    });
  });
})();
