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
    'project-manager': {
      content: `
        <h4>Role Overview</h4>
        <p>We are seeking an experienced Project Manager to lead the delivery of complex infrastructure and construction projects across Southeast Europe, ensuring execution aligned with technical, contractual, and financial objectives.</p>
        <h4>Key Responsibilities</h4>
        <ul>
            <li>Manage full project lifecycle from planning to delivery</li>
            <li>Control budgets, timelines, and resources</li>
            <li>Coordinate multidisciplinary teams and stakeholders</li>
            <li>Ensure compliance with contracts, standards, and regulations</li>
            <li>Report on progress, risks, and performance</li>
        </ul>
        <h4>Required Experience</h4>
        <ul>
            <li>8–15+ years in construction or infrastructure projects</li>
            <li>Proven experience managing projects €10M–€50M+</li>
            <li>Experience with EU/IFI-funded projects is highly preferred</li>
        </ul>
        <h4>Qualifications</h4>
        <ul>
            <li>Degree in Civil Engineering or related field</li>
            <li>PMP, FIDIC, or equivalent certification (preferred)</li>
            <li>Strong knowledge of project management tools and contracts</li>
        </ul>
      `
    },
    'site-engineer': {
      content: `
        <h4>Role Overview</h4>
        <p>We are seeking a Site Engineer to support on-site execution and ensure all works are delivered according to design, quality standards, and timelines.</p>
        <h4>Key Responsibilities</h4>
        <ul>
            <li>Supervise construction works and site activities</li>
            <li>Ensure alignment with technical drawings and specifications</li>
            <li>Coordinate subcontractors and suppliers</li>
            <li>Monitor quality and progress</li>
            <li>Support issue resolution on-site</li>
        </ul>
        <h4>Required Experience</h4>
        <ul>
            <li>3–8 years in construction or infrastructure projects</li>
            <li>Experience on medium to large construction sites</li>
        </ul>
        <h4>Qualifications</h4>
        <ul>
            <li>Degree in Civil Engineering</li>
            <li>Strong knowledge of construction processes and drawings</li>
            <li>Familiarity with site documentation and reporting</li>
        </ul>
      `
    },
    'surveyor-engineer': {
      content: `
        <h4>Role Overview</h4>
        <p>We are seeking a Surveyor Engineer to ensure precision in measurement, alignment, and positioning across all project phases.</p>
        <h4>Key Responsibilities</h4>
        <ul>
            <li>Perform topographic and construction surveys</li>
            <li>Set out works and verify alignment</li>
            <li>Prepare survey reports and documentation</li>
            <li>Use GPS, total stations, and modern surveying tools</li>
            <li>Monitor deviations and ensure accuracy</li>
        </ul>
        <h4>Required Experience</h4>
        <ul>
            <li>3–7 years in construction surveying</li>
            <li>Experience in infrastructure projects preferred</li>
        </ul>
        <h4>Qualifications</h4>
        <ul>
            <li>Degree or certification in Surveying or Geodesy</li>
            <li>Proficiency with surveying equipment and software</li>
        </ul>
      `
    },
    'cost-engineer': {
      content: `
        <h4>Role Overview</h4>
        <p>We are seeking a Cost Engineer to manage budgeting, cost control, and financial performance of projects.</p>
        <h4>Key Responsibilities</h4>
        <ul>
            <li>Prepare cost estimates and budgets</li>
            <li>Monitor project costs and financial performance</li>
            <li>Manage variations, claims, and valuations</li>
            <li>Support tender pricing</li>
            <li>Ensure cost efficiency</li>
        </ul>
        <h4>Required Experience</h4>
        <ul>
            <li>5–10 years in cost control or quantity surveying</li>
            <li>Experience with infrastructure or civil projects</li>
        </ul>
        <h4>Qualifications</h4>
        <ul>
            <li>Degree in Civil Engineering, Construction Management, or Finance</li>
            <li>Strong Excel and cost management tools skills</li>
        </ul>
      `
    },
    'electrical-engineer': {
      content: `
        <h4>Role Overview</h4>
        <p>We are seeking an Electrical Engineer to design and oversee electrical systems in infrastructure and energy projects.</p>
        <h4>Key Responsibilities</h4>
        <ul>
            <li>Design and supervise electrical systems</li>
            <li>Ensure compliance with standards</li>
            <li>Oversee installation and commissioning</li>
            <li>Coordinate with project teams</li>
            <li>Troubleshoot and optimize systems</li>
        </ul>
        <h4>Required Experience</h4>
        <ul>
            <li>5–10 years in electrical engineering projects</li>
            <li>Experience in infrastructure or energy sector preferred</li>
        </ul>
        <h4>Qualifications</h4>
        <ul>
            <li>Degree in Electrical Engineering</li>
            <li>Knowledge of EU standards and power systems</li>
        </ul>
      `
    },
    'mechanical-engineer': {
      content: `
        <h4>Role Overview</h4>
        <p>We are seeking a Mechanical Engineer to support design and execution of mechanical systems in infrastructure and environmental projects.</p>
        <h4>Key Responsibilities</h4>
        <ul>
            <li>Design and oversee mechanical systems</li>
            <li>Supervise installation and commissioning</li>
            <li>Ensure compliance with standards</li>
            <li>Support system optimization</li>
            <li>Prepare technical documentation</li>
        </ul>
        <h4>Required Experience</h4>
        <ul>
            <li>5–10 years in mechanical engineering</li>
            <li>Experience in water, wastewater, or industrial systems preferred</li>
        </ul>
        <h4>Qualifications</h4>
        <ul>
            <li>Degree in Mechanical Engineering</li>
            <li>Knowledge of pumps, pipelines, and treatment systems</li>
        </ul>
      `
    },
    'environmental-expert': {
      content: `
        <h4>Role Overview</h4>
        <p>We are seeking an Environmental Expert to ensure projects meet environmental standards and sustainability requirements.</p>
        <h4>Key Responsibilities</h4>
        <ul>
            <li>Conduct environmental impact assessments</li>
            <li>Ensure compliance with EU and local regulations</li>
            <li>Develop environmental management plans</li>
            <li>Monitor environmental performance</li>
            <li>Liaise with authorities and stakeholders</li>
        </ul>
        <h4>Required Experience</h4>
        <ul>
            <li>5–10 years in environmental engineering or consulting</li>
            <li>Experience with EU-funded projects highly preferred</li>
        </ul>
        <h4>Qualifications</h4>
        <ul>
            <li>Degree in Environmental Engineering or related field</li>
            <li>Knowledge of EU environmental directives</li>
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
