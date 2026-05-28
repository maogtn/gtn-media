/* ============================================================
   GTN Media — Main JS
   Rules applied: Rule 4 (trace full flow), Rule 5 (validate at boundary),
   Rule 10 (no over-engineering), Rule 14 (clear feedback on every action)
   ============================================================ */

(function () {
  'use strict';

  /* ── DOM refs ── */
  const header      = document.getElementById('header');
  const navToggle   = document.getElementById('nav-toggle');
  const navLinks    = document.getElementById('nav-links');
  const form        = document.getElementById('contact-form');
  const submitBtn   = document.getElementById('submit-btn');
  const formSuccess = document.getElementById('form-success');
  const formError   = document.getElementById('form-error');

  /* ── Sticky header ── */
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 20);
    highlightActiveNav();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Active nav link ── */
  const sections   = document.querySelectorAll('main section[id]');
  const navAnchors = navLinks.querySelectorAll('li:not(.nav__mobile-cta) a');

  function highlightActiveNav() {
    let current = '';
    sections.forEach(function (s) {
      if (window.scrollY >= s.offsetTop - 130) current = s.id;
    });
    navAnchors.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  /* ── Mobile nav ── */
  navToggle.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  /* ── Scroll fade-in animations ── */
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.fade-in').forEach(function (el) { observer.observe(el); });

  /* ── Form validation (Rule 5: validate at boundary) ── */
  function getField(id) { return document.getElementById(id); }
  function getError(id) { return document.getElementById(id + '-error'); }

  function showError(id, msg) {
    getField(id).classList.add('is-error');
    getError(id).textContent = msg;
  }

  function clearError(id) {
    getField(id).classList.remove('is-error');
    getError(id).textContent = '';
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  function validateForm() {
    let valid = true;
    const name     = getField('name').value.trim();
    const business = getField('business').value.trim();
    const email    = getField('email').value.trim();

    clearError('name');
    clearError('business');
    clearError('email');

    if (!name)                  { showError('name', 'Please enter your name.');            valid = false; }
    if (!business)              { showError('business', 'Please enter your business name.'); valid = false; }
    if (!email)                 { showError('email', 'Please enter your email address.');  valid = false; }
    else if (!isValidEmail(email)) { showError('email', 'Please enter a valid email.');    valid = false; }

    return valid;
  }

  ['name', 'business', 'email'].forEach(function (id) {
    getField(id).addEventListener('input', function () { clearError(id); });
  });

  /* ── Form submission — Formspree (Rule 14: idle → loading → success/error) ── */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm()) return;

    var name     = getField('name').value.trim();
    var business = getField('business').value.trim();
    var email    = getField('email').value.trim();
    var phone    = getField('phone').value.trim();
    var message  = getField('message').value.trim();

    submitBtn.disabled = true;
    submitBtn.querySelector('.btn__text').hidden = true;
    submitBtn.querySelector('.btn__loading').hidden = false;
    formSuccess.hidden = true;
    formError.hidden = true;

    fetch('https://formspree.io/f/xqejnydq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name:     name,
        business: business,
        email:    email,
        phone:    phone    || 'Not provided',
        message:  message  || 'No message.'
      })
    })
    .then(function (res) {
      if (res.ok) {
        form.querySelectorAll('input, textarea').forEach(function (el) { el.value = ''; });
        submitBtn.hidden = true;
        formSuccess.hidden = false;
      } else {
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn__text').hidden = false;
        submitBtn.querySelector('.btn__loading').hidden = true;
        formError.hidden = false;
      }
    })
    .catch(function () {
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn__text').hidden = false;
      submitBtn.querySelector('.btn__loading').hidden = true;
      formError.hidden = false;
    });
  });

}());

/* ── FAQ accordion ── */
document.querySelectorAll('.faq-item__trigger').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var item    = this.closest('.faq-item');
    var isOpen  = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(function (el) {
      el.classList.remove('open');
      el.querySelector('.faq-item__trigger').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      this.setAttribute('aria-expanded', 'true');
    }
  });
});
