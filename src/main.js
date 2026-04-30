import './style.css'

console.log('2XAR Main JS Loading...');

// --- VERTICAL ACCORDION LOGIC ---
const accordionItems = document.querySelectorAll('.accordion-item');

function switchAccordion(pillarId) {
  console.log('Switching to accordion:', pillarId);
  accordionItems.forEach(item => {
    if (item.getAttribute('data-pillar') === pillarId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

if (accordionItems.length > 0) {
  accordionItems.forEach(item => {
    const id = item.getAttribute('data-pillar');
    if (id) {
      // Direct hover listener on the item
      item.addEventListener('mouseenter', () => switchAccordion(id));
      // Fallback click listener
      item.addEventListener('click', () => switchAccordion(id));
      
      // Also attach to the trigger child explicitly
      const trigger = item.querySelector('.accordion-trigger');
      if (trigger) {
        trigger.addEventListener('mouseenter', (e) => {
          e.stopPropagation();
          switchAccordion(id);
        });
      }
    }
  });
}

// --- HERO INDICATORS AUTOCYCLE ---
const indicators = document.querySelectorAll('.indicator-item');
const heroVideos = document.querySelectorAll('.hero-video');
let currentIndicator = 0;
let indicatorInterval;

function switchHeroSlide(index) {
  if (heroVideos.length > 0) {
    heroVideos.forEach((vid, i) => {
      if (i === index) {
        vid.classList.add('active');
        vid.play().catch(() => { });
      } else {
        vid.classList.remove('active');
      }
    });
  }
}

function startIndicatorCycle() {
  if (indicators.length > 0) {
    clearInterval(indicatorInterval);
    indicatorInterval = setInterval(() => {
      indicators[currentIndicator].classList.remove('active');
      currentIndicator = (currentIndicator + 1) % indicators.length;
      indicators[currentIndicator].classList.add('active');
      switchHeroSlide(currentIndicator);
    }, 6000);
  }
}

if (indicators.length > 0) {
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      indicators[currentIndicator].classList.remove('active');
      currentIndicator = index;
      indicators[currentIndicator].classList.add('active');
      switchHeroSlide(currentIndicator);
      startIndicatorCycle();
    });
  });
  startIndicatorCycle();
}

// --- SMOOTH SCROLL ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    if (targetId && targetId !== '#') {
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// --- MOBILE MENU ---
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
const closeMenuBtn = document.querySelector('.close-menu');

if (menuToggle && mobileMenuOverlay) {
  menuToggle.addEventListener('click', () => {
    mobileMenuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  if (closeMenuBtn) {
    closeMenuBtn.addEventListener('click', () => {
      mobileMenuOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  const mobileLinks = mobileMenuOverlay.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// --- JOB MODAL LOGIC ---
const jobModal = document.getElementById('jobModal');
const detailsBtns = document.querySelectorAll('.details-btn');
const closeModalBtn = document.querySelector('.close-modal');
const modalTitle = document.getElementById('modalTitle');
const modalLocation = document.getElementById('modalLocation');
const modalDescription = document.getElementById('modalDescription');
const copyEmailBtn = document.getElementById('copyEmail');

const jobDetails = {
  'project-manager': {
    content: `
      <h4>Role Overview</h4>
      <p>We are seeking an experienced Project Manager to lead the delivery of complex infrastructure and construction projects across Southeast Europe.</p>
    `
  }
};

if (jobModal && detailsBtns.length > 0) {
  detailsBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const jobId = btn.getAttribute('data-job');
      const title = btn.getAttribute('data-title');
      const location = btn.getAttribute('data-location');
      const details = jobDetails[jobId];

      if (details && modalTitle && modalLocation && modalDescription) {
        modalTitle.textContent = title;
        modalLocation.innerHTML = `<i class="ph ph-map-pin"></i> ${location}`;
        modalDescription.innerHTML = details.content;
        jobModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      jobModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  jobModal.addEventListener('click', (e) => {
    if (e.target === jobModal) {
      jobModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// --- COPY EMAIL ---
if (copyEmailBtn) {
  copyEmailBtn.addEventListener('click', () => {
    const emailEl = document.querySelector('.email-value');
    if (emailEl) {
      const email = emailEl.textContent;
      navigator.clipboard.writeText(email).then(() => {
        const originalText = copyEmailBtn.textContent;
        copyEmailBtn.textContent = 'Copied!';
        copyEmailBtn.classList.add('active');
        setTimeout(() => {
          copyEmailBtn.textContent = originalText;
          copyEmailBtn.classList.remove('active');
        }, 2000);
      });
    }
  });
}
