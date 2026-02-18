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
  const heroVideos = document.querySelectorAll('.hero-video');
  let currentIndicator = 0;
  let indicatorInterval;

  function switchHeroSlide(index) {
    heroVideos.forEach((vid, i) => {
      if (i === index) {
        vid.classList.add('active');
        vid.play().catch(() => { });
      } else {
        vid.classList.remove('active');
      }
    });
  }

  function startIndicatorCycle() {
    clearInterval(indicatorInterval);
    indicatorInterval = setInterval(() => {
      indicators[currentIndicator].classList.remove('active');
      currentIndicator = (currentIndicator + 1) % indicators.length;
      indicators[currentIndicator].classList.add('active');
      switchHeroSlide(currentIndicator);
    }, 6000); // Match CSS animation duration
  }

  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      indicators[currentIndicator].classList.remove('active');
      currentIndicator = index;
      indicators[currentIndicator].classList.add('active');
      switchHeroSlide(currentIndicator);
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

  // Job Modal Logic
  const jobModal = document.getElementById('jobModal');
  const detailsBtns = document.querySelectorAll('.details-btn');
  const closeModalBtn = document.querySelector('.close-modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalLocation = document.getElementById('modalLocation');
  const modalDescription = document.getElementById('modalDescription');
  const copyEmailBtn = document.getElementById('copyEmail');

  const jobDetails = {
    'senior-civil': {
      content: `
        <h4>Role Overview</h4>
        <p>We are seeking a highly experienced Senior Civil Engineer to lead complex infrastructure projects across the Western Balkans. You will be responsible for technical design oversight, project management, and ensuring the highest engineering standards.</p>
        <h4>Key Responsibilities</h4>
        <ul>
            <li>Lead design and execution of large-scale civil works.</li>
            <li>Coordinate with international partners and local stakeholders.</li>
            <li>Ensure compliance with Eurocode and local regulations.</li>
            <li>Mentor junior engineering staff.</li>
        </ul>
      `
    },
    'site-manager': {
      content: `
        <h4>Role Overview</h4>
        <p>Seeking an experienced Site Manager for major road and highway infrastructure projects. You will oversee daily operations, manage sub-contractors, and ensure timeline and budget adherence under strict quality controls.</p>
        <h4>Key Responsibilities</h4>
        <ul>
            <li>Daily site supervision and resource management.</li>
            <li>Directing logistics and materials procurement.</li>
            <li>Reporting on project progress and safety metrics.</li>
            <li>Maintaining liaison with client representatives.</li>
        </ul>
      `
    },
    'hse-officer': {
      content: `
        <h4>Role Overview</h4>
        <p>Join our team as an HSE Officer to maintain our zero-incident safety record. You will implement and monitor safety procedures across active construction sites, ensuring the protection of all personnel and environment.</p>
        <h4>Key Responsibilities</h4>
        <ul>
            <li>Regular site safety inspections and audits.</li>
            <li>HSE training and onboarding for new personnel.</li>
            <li>Emergency response coordination.</li>
            <li>Ensuring full compliance with international safety protocols.</li>
        </ul>
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

        if (details) {
          modalTitle.textContent = title;
          modalLocation.innerHTML = `<i class="ph ph-map-pin"></i> ${location}`;
          modalDescription.innerHTML = details.content;
          jobModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    closeModalBtn.addEventListener('click', () => {
      jobModal.classList.remove('active');
      document.body.style.overflow = '';
    });

    jobModal.addEventListener('click', (e) => {
      if (e.target === jobModal) {
        jobModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // Copy Email Feature
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      const email = document.querySelector('.email-value').textContent;
      navigator.clipboard.writeText(email).then(() => {
        const originalText = copyEmailBtn.textContent;
        copyEmailBtn.textContent = 'Copied!';
        copyEmailBtn.classList.add('active');

        setTimeout(() => {
          copyEmailBtn.textContent = originalText;
          copyEmailBtn.classList.remove('active');
        }, 2000);
      });
    });
  }

});
