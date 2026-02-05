import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  const accordionItems = document.querySelectorAll('.accordion-item');

  function switchAccordion(pillarId) {
    accordionItems.forEach(item => {
      if (item.getAttribute('data-pillar') === pillarId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  accordionItems.forEach(item => {
    const id = item.getAttribute('data-pillar');

    // Support both click and hover
    item.addEventListener('click', () => switchAccordion(id));
    item.addEventListener('mouseenter', () => switchAccordion(id));
  });

  // Hero Indicators Autocycle
  const indicators = document.querySelectorAll('.indicator-item');
  let currentIndicator = 0;
  let indicatorInterval;

  function startIndicatorCycle() {
    clearInterval(indicatorInterval);
    indicatorInterval = setInterval(() => {
      indicators[currentIndicator].classList.remove('active');
      currentIndicator = (currentIndicator + 1) % indicators.length;
      indicators[currentIndicator].classList.add('active');
    }, 6000); // Match CSS animation duration
  }

  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      indicators[currentIndicator].classList.remove('active');
      currentIndicator = index;
      indicators[currentIndicator].classList.add('active');
      startIndicatorCycle(); // Reset timer on manual click
    });
  });

  if (indicators.length > 0) {
    startIndicatorCycle();
  }

  // Smooth scroll for anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
  // Mobile Menu Logic
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
  const closeMenuBtn = document.querySelector('.close-menu');

  if (menuToggle && mobileMenuOverlay) {
    menuToggle.addEventListener('click', () => {
      mobileMenuOverlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    });

    if (closeMenuBtn) {
      closeMenuBtn.addEventListener('click', () => {
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    // Close on link click
    const mobileLinks = mobileMenuOverlay.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

});
