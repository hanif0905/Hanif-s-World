// ===== HAMBURGER MENU TOGGLE =====
const ham = document.querySelector('.hamburger');
const drop = document.querySelector('.dropdown-menu');

// Make sure menu starts hidden
if (drop) {
  drop.hidden = true;
}

if (ham && drop) {
  // Toggle menu on hamburger click
  ham.addEventListener('click', (e) => {
    e.stopPropagation(); // Don't trigger document click
    const isOpen = !drop.hidden;
    drop.hidden = isOpen; // if open, hide; if hidden, show
    ham.setAttribute('aria-expanded', String(!isOpen));
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!drop.hidden && !drop.contains(e.target) && !ham.contains(e.target)) {
      drop.hidden = true;
      ham.setAttribute('aria-expanded', 'false');
    }
  });

  // Close menu on Esc key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !drop.hidden) {
      drop.hidden = true;
      ham.setAttribute('aria-expanded', 'false');
    }
  });

  // Close menu after clicking a link
  drop.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      drop.hidden = true;
      ham.setAttribute('aria-expanded', 'false');
    });
  });
}
// ===== MOBILE FEATURE DROPDOWN (works like hamburger) =====
const featureToggle = document.querySelector('.feature-toggle');
const featureGrid = document.querySelector('.feature-grid');

function isMobile() {
  return window.matchMedia('(max-width: 599px)').matches;
}

if (featureToggle && featureGrid) {
  // Ensure correct initial state
  const setClosed = () => {
    featureToggle.setAttribute('aria-expanded', 'false');
    featureGrid.classList.remove('open');
  };
  const setOpen = () => {
    featureToggle.setAttribute('aria-expanded', 'true');
    featureGrid.classList.add('open');
  };

  // Start closed on mobile; always open on desktop/tablet
  const applyMode = () => {
    if (isMobile()) {
      setClosed();
    } else {
      setOpen(); // visible on larger screens
    }
  };
  applyMode();

  // Toggle on button click (mobile only)
  featureToggle.addEventListener('click', (e) => {
    if (!isMobile()) return; // ignore on desktop/tablet
    e.stopPropagation();
    const expanded = featureToggle.getAttribute('aria-expanded') === 'true';
    if (expanded) setClosed(); else setOpen();
  });

  // Close when clicking outside (mobile only)
  document.addEventListener('click', (e) => {
    if (!isMobile()) return;
    if (featureGrid.classList.contains('open') &&
        !featureGrid.contains(e.target) &&
        !featureToggle.contains(e.target)) {
      setClosed();
    }
  });

  // Close on Esc (mobile only)
  document.addEventListener('keydown', (e) => {
    if (!isMobile()) return;
    if (e.key === 'Escape' && featureGrid.classList.contains('open')) {
      setClosed();
    }
  });

  // Handle viewport changes (resize/rotate)
  window.addEventListener('resize', applyMode);
}


// ===== DAILY QUOTE =====
const dailyQuotes = [
  "Every sunrise is a fresh page in the story of our lives.",
  "Let your faith be bigger than your fear.",
  "Joy is not in things; it is in us.",
  "A kind word is like a spring day.",
  "Dreams are plans in pajamas — wake them gently."
];
const quoteEl = document.getElementById('daily-quote');
if (quoteEl) {
  const idx = new Date().getDate() % dailyQuotes.length;
  quoteEl.textContent = dailyQuotes[idx];
}

// ===== BACK TO TOP BUTTON =====
const b2t = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  if (b2t) {
    b2t.style.opacity = window.scrollY > 200 ? '1' : '0';
  }
});
