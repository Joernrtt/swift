(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initStickyHeader();
    initRevealObserver();
    initMetricCounters();
    initFaqAccordion();
    initSmoothScroll();
    initLangToggle();
    initProcessHighlight();
  });

  /* --------------------------------------------------
     1. MOBILE NAV TOGGLE
  -------------------------------------------------- */
  function initMobileNav() {
    var burger = document.getElementById('nav-burger');
    var links  = document.getElementById('nav-links');
    var header = document.getElementById('site-header');

    if (!burger || !links || !header) return;

    burger.addEventListener('click', function () {
      var isOpen = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!isOpen));
      header.classList.toggle('nav--mobile-open');
    });

    document.addEventListener('click', function (e) {
      if (!header.contains(e.target)) {
        burger.setAttribute('aria-expanded', 'false');
        header.classList.remove('nav--mobile-open');
      }
    });

    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        burger.setAttribute('aria-expanded', 'false');
        header.classList.remove('nav--mobile-open');
      });
    });
  }

  /* --------------------------------------------------
     2. STICKY HEADER SHADOW
  -------------------------------------------------- */
  function initStickyHeader() {
    var header = document.getElementById('site-header');
    if (!header) return;

    function onScroll() {
      header.classList.toggle('site-header--scrolled', window.scrollY > 20);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --------------------------------------------------
     3. SCROLL-REVEAL (IntersectionObserver)
  -------------------------------------------------- */
  function initRevealObserver() {
    var elements = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var delay = parseInt(entry.target.dataset.revealDelay || '0', 10);
        setTimeout(function () {
          entry.target.classList.add('is-visible');
        }, delay);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });

    /* Stagger siblings within the same grid container */
    var seen = new WeakMap();
    elements.forEach(function (el) {
      var parent = el.parentElement;
      if (!seen.has(parent)) seen.set(parent, 0);
      var idx = seen.get(parent);
      el.dataset.revealDelay = idx * 90;
      seen.set(parent, idx + 1);
      observer.observe(el);
    });
  }

  /* --------------------------------------------------
     4. METRIC COUNTER ANIMATION
  -------------------------------------------------- */
  function initMetricCounters() {
    var metrics = document.querySelectorAll('[data-target]');
    if (!metrics.length) return;

    if (!('IntersectionObserver' in window)) {
      metrics.forEach(function (m) { finaliseCounter(m); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    metrics.forEach(function (m) { observer.observe(m); });
  }

  function animateCounter(el) {
    var target  = parseInt(el.dataset.target, 10);
    var display = el.querySelector('.metric__number') || el.querySelector('.stat__number');
    if (!display) return;

    var duration = 1800;
    var start    = performance.now();

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function tick(now) {
      var elapsed  = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var value    = Math.round(easeOut(progress) * target);
      display.textContent = value.toLocaleString('de-DE');
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function finaliseCounter(el) {
    var target  = parseInt(el.dataset.target, 10);
    var display = el.querySelector('.metric__number') || el.querySelector('.stat__number');
    if (display) display.textContent = target.toLocaleString('de-DE');
  }

  /* --------------------------------------------------
     5. FAQ ACCORDION
  -------------------------------------------------- */
  function initFaqAccordion() {
    var items = document.querySelectorAll('.faq__item');
    if (!items.length) return;

    items.forEach(function (item) {
      var btn    = item.querySelector('.faq__question');
      var answer = item.querySelector('.faq__answer');
      if (!btn || !answer) return;

      btn.addEventListener('click', function () {
        var isOpen = btn.getAttribute('aria-expanded') === 'true';

        /* Close all others */
        items.forEach(function (other) {
          if (other === item) return;
          var otherBtn    = other.querySelector('.faq__question');
          var otherAnswer = other.querySelector('.faq__answer');
          if (!otherBtn || !otherAnswer) return;
          otherBtn.setAttribute('aria-expanded', 'false');
          otherAnswer.style.maxHeight = null;
          otherAnswer.addEventListener('transitionend', function handler() {
            otherAnswer.setAttribute('hidden', '');
            otherAnswer.removeEventListener('transitionend', handler);
          });
        });

        if (isOpen) {
          btn.setAttribute('aria-expanded', 'false');
          answer.style.maxHeight = null;
          answer.addEventListener('transitionend', function handler() {
            answer.setAttribute('hidden', '');
            answer.removeEventListener('transitionend', handler);
          });
        } else {
          answer.removeAttribute('hidden');
          btn.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });
  }

  /* --------------------------------------------------
     6. SMOOTH SCROLL — respect prefers-reduced-motion
  -------------------------------------------------- */
  function initSmoothScroll() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.style.scrollBehavior = 'auto';
    }
  }

  /* --------------------------------------------------
     7. PROCESS STEP AUTO-HIGHLIGHT
     On scroll into view, step 1 gets the hover highlight automatically.
     It disappears as soon as the user hovers any other step.
  -------------------------------------------------- */
  function initProcessHighlight() {
    var section = document.getElementById('erfolge');
    if (!section) return;

    var steps = section.querySelectorAll('.tl-step');
    if (!steps.length) return;

    var firstStep = steps[0];
    var dismissed = false;
    var highlightTimer = null;

    /* Remove auto-highlight and stop responding once user takes over */
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      clearTimeout(highlightTimer);
      firstStep.classList.remove('tl-step--auto-highlight');
    }

    steps.forEach(function (step, i) {
      if (i === 0) return;
      step.addEventListener('mouseenter', dismiss);
    });

    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || dismissed) return;
        /* Wait for reveal animation (~600ms) before adding highlight */
        highlightTimer = setTimeout(function () {
          if (!dismissed) firstStep.classList.add('tl-step--auto-highlight');
        }, 650);
        observer.unobserve(section);
      });
    }, { threshold: 0.2 });

    observer.observe(section);
  }

  /* --------------------------------------------------
     8. LANGUAGE TOGGLE (stub — EN copy pending)
  -------------------------------------------------- */
  function initLangToggle() {
    var btn = document.getElementById('lang-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      /* Placeholder — wire up i18n data object when EN translation is ready */
    });
  }

})();
