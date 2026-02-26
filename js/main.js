/* ============================================================
   PERSONAL WEBSITE — MAIN JAVASCRIPT

   Contents:
   1. Configuration
   2. Dark Mode
   3. Hamburger Menu
   4. Active Nav Link
   5. Scroll Reveal (IntersectionObserver)
   6. Scroll-to-top Button
   7. Form Validation (Mail Room)
   8. Init
   ============================================================ */


/* ============================================================
   1. CONFIGURATION
   ============================================================ */

const CONFIG = {
  THEME_KEY:        'theme',
  SCROLL_THRESHOLD: 300,
  REVEAL_THRESHOLD: 0.15,
  REVEAL_ROOT_MARGIN: '0px 0px -60px 0px',
};


/* ============================================================
   2. DARK MODE
   Respects OS preference on first visit;
   saves manual choice to localStorage.
   ============================================================ */

const themeToggle = document.getElementById('theme-toggle');

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(CONFIG.THEME_KEY, theme);

  if (themeToggle) {
    themeToggle.setAttribute(
      'aria-label',
      `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`
    );
    themeToggle.innerHTML = theme === 'dark'
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
  }
}

function initTheme() {
  const saved = localStorage.getItem(CONFIG.THEME_KEY);
  applyTheme(saved || getSystemTheme());
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// Respond to OS-level theme changes only if user hasn't manually chosen
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (!localStorage.getItem(CONFIG.THEME_KEY)) {
    applyTheme(e.matches ? 'dark' : 'light');
  }
});


/* ============================================================
   3. HAMBURGER MENU
   Toggles .open on .navbar-links and .navbar-toggle.
   Closes on outside click or ESC.
   ============================================================ */

const navbarToggle = document.querySelector('.navbar-toggle');
const navbarLinks  = document.querySelector('.navbar-links');

function openMenu() {
  navbarLinks?.classList.add('open');
  navbarToggle?.classList.add('open');
  navbarToggle?.setAttribute('aria-expanded', 'true');
}

function closeMenu() {
  navbarLinks?.classList.remove('open');
  navbarToggle?.classList.remove('open');
  navbarToggle?.setAttribute('aria-expanded', 'false');
}

function toggleMenu() {
  navbarLinks?.classList.contains('open') ? closeMenu() : openMenu();
}

// Close when any nav link is clicked (mobile UX)
navbarLinks?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close on outside click
document.addEventListener('click', e => {
  if (
    navbarLinks?.classList.contains('open') &&
    !navbarLinks.contains(e.target) &&
    !navbarToggle?.contains(e.target)
  ) {
    closeMenu();
  }
});

// Close on ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});


/* ============================================================
   4. ACTIVE NAV LINK
   Adds .active to whichever link matches the current page.
   ============================================================ */

function setActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.navbar-links a').forEach(link => {
    const linkPath = link.getAttribute('href')?.split('/').pop();
    link.classList.toggle('active', linkPath === currentPath);
  });
}


/* ============================================================
   5. SCROLL REVEAL
   Watches .reveal and .stagger-children elements;
   adds .visible when they enter the viewport.
   Animates once only — observer stops watching after trigger.
   ============================================================ */

function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal, .stagger-children');
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold:  CONFIG.REVEAL_THRESHOLD,
      rootMargin: CONFIG.REVEAL_ROOT_MARGIN,
    }
  );

  targets.forEach(el => observer.observe(el));
}


/* ============================================================
   6. SCROLL-TO-TOP BUTTON
   Appears after scrolling past CONFIG.SCROLL_THRESHOLD px.
   Requires <button id="scroll-top"> in HTML.
   ============================================================ */

const scrollTopBtn = document.getElementById('scroll-top');

function handleScrollTopVisibility() {
  if (!scrollTopBtn) return;
  scrollTopBtn.classList.toggle('visible', window.scrollY > CONFIG.SCROLL_THRESHOLD);
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


/* ============================================================
   7. FORM VALIDATION — Mail Room
   Lightweight client-side validation for contact.html.
   Requires:
     <form id="contact-form">
       <input id="name">
       <input id="email">
       <textarea id="message">
     </form>
   ============================================================ */

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name    = form.querySelector('#name');
    const email   = form.querySelector('#email');
    const message = form.querySelector('#message');
    let valid = true;

    // Clear previous errors
    form.querySelectorAll('.field-error').forEach(el => el.remove());
    form.querySelectorAll('.form-group input, .form-group textarea')
        .forEach(el => el.style.borderColor = '');

    function showError(field, msg) {
      field.style.borderColor = 'var(--burgundy)';

      const err = document.createElement('span');
      err.className   = 'field-error';
      err.textContent = msg;
      err.style.cssText = `
        font-family: 'Nunito', sans-serif;
        font-size: 0.75rem;
        color: var(--burgundy);
        margin-top: 0.25rem;
        display: block;
      `;
      field.parentNode.appendChild(err);
      valid = false;
    }

    if (!name?.value.trim())
      showError(name, 'Please enter your name.');

    if (!email?.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
      showError(email, 'Please enter a valid email address.');

    if (!message?.value.trim() || message.value.trim().length < 20)
      showError(message, 'Message must be at least 20 characters.');

    if (valid) {
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.textContent  = 'Sent ✦';
        btn.disabled     = true;
        btn.style.background = 'var(--green-dark)';
        btn.style.borderColor = 'var(--green-dark)';
      }
      // form.submit(); // uncomment when wired to Formspree / Netlify Forms
    }
  });
}


/* ============================================================
   8. INIT
   Runs all modules after the DOM is ready.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Theme
  initTheme();
  themeToggle?.addEventListener('click', toggleTheme);

  // Navigation
  navbarToggle?.addEventListener('click', toggleMenu);
  setActiveNavLink();

  // Scroll reveal
  initScrollReveal();

  // Scroll-to-top
  window.addEventListener('scroll', handleScrollTopVisibility, { passive: true });
  scrollTopBtn?.addEventListener('click', scrollToTop);

  // Contact form
  initContactForm();

});
