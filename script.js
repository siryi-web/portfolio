(() => {
  'use strict';

  // 1. Mobile Navigation Toggle
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const primaryNav = document.getElementById('primary-nav');

  if (menuToggle && primaryNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = primaryNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    primaryNav.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        primaryNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 2. Update SCORM Status Badge in Hero Terminal
  const lmsBadge = document.getElementById('lms-status-badge');
  if (lmsBadge && typeof getAPI === 'function') {
    const api = getAPI();
    if (api) {
      lmsBadge.textContent = 'SCORM: CONNECTED';
    } else {
      lmsBadge.textContent = 'SCORM: STANDALONE';
    }
  }

  // 3. Automation Impact Estimator (Hero Slider)
  const cohortSlider = document.getElementById('cohort-slider');
  const cohortOutput = document.getElementById('cohort-output');
  const hoursSavedVal = document.getElementById('hours-saved-val');
  const ttcVal = document.getElementById('ttc-val');

  if (cohortSlider && cohortOutput && hoursSavedVal && ttcVal) {
    const updateRoiMetrics = () => {
      const learners = Number(cohortSlider.value);
      cohortOutput.textContent = `${learners} Learners`;

      // 0.45 admin hours saved per learner via automated provisioning & tracking
      const hoursSaved = Math.round(learners * 0.45);
      // Scale efficiency gain between 32% and 55%
      const efficiencyGain = Math.min(55, Math.round(32 + (learners / 1000) * 23));

      hoursSavedVal.textContent = `${hoursSaved} hrs`;
      ttcVal.textContent = `-${efficiencyGain}% faster`;
    };

    cohortSlider.addEventListener('input', updateRoiMetrics);
    updateRoiMetrics();
  }

  // 4. Interactive Experience & Skills Matrix (Filter, Search & Expand)
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('skill-search');
  const matrixCards = document.querySelectorAll('.matrix-card');
  const noResultsMsg = document.getElementById('no-results-msg');

  let activeCategory = 'all';
  let searchQuery = '';

  const filterMatrix = () => {
    let visibleCount = 0;

    matrixCards.forEach((card) => {
      const category = card.getAttribute('data-category') || '';
      const textContent = card.textContent.toLowerCase();

      const matchesCategory = activeCategory === 'all' || category === activeCategory;
      const matchesSearch = !searchQuery || textContent.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.hidden = false;
        visibleCount++;
      } else {
        card.hidden = true;
      }
    });

    if (noResultsMsg) {
      noResultsMsg.hidden = visibleCount > 0;
    }
  };

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      activeCategory = btn.getAttribute('data-filter') || 'all';
      filterMatrix();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      filterMatrix();
    });
  }

  // Expand / Collapse Card Details
  const toggleCardDetails = (card) => {
    const details = card.querySelector('.card-details');
    const expandBtn = card.querySelector('.card-expand-btn');
    if (!details || !expandBtn) return;

    const isExpanded = !details.hidden;
    details.hidden = isExpanded;
    card.classList.toggle('expanded', !isExpanded);
    expandBtn.setAttribute('aria-expanded', String(!isExpanded));
    expandBtn.innerHTML = isExpanded ? 'Inspect Details &rarr;' : 'Hide Details &uarr;';
  };

  matrixCards.forEach((card) => {
    card.addEventListener('click', () => {
      toggleCardDetails(card);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCardDetails(card);
      }
    });
  });

  // 5. Contact Form Handling & SCORM Telemetry Hook
  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');

  if (contactForm && formFeedback) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = contactForm.querySelector('#sender-name')?.value.trim();
      const email = contactForm.querySelector('#sender-email')?.value.trim();
      const scope = contactForm.querySelector('#inquiry-scope')?.value;
      const message = contactForm.querySelector('#sender-message')?.value.trim();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name || !email || !message) {
        formFeedback.hidden = false;
        formFeedback.className = 'form-feedback error';
        formFeedback.textContent = 'Please complete all required fields (Name, Work Email, and Project Details).';
        return;
      }

      if (!emailRegex.test(email)) {
        formFeedback.hidden = false;
        formFeedback.className = 'form-feedback error';
        formFeedback.textContent = 'Please enter a valid work email address.';
        return;
      }

      formFeedback.hidden = false;
      formFeedback.className = 'form-feedback success';
      formFeedback.textContent = `Transmission received, ${name}! Your ${scope} inquiry has been logged.`;

      // Record completion in SCORM runtime if connected to an LMS
      if (typeof recordPortfolioCompletion === 'function') {
        recordPortfolioCompletion(100);
      }

      contactForm.reset();
    });
  }

  // 6. Dynamic Year in Footer
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
