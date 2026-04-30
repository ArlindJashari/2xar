import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, 'cms.db');

const db = new Database(DB_PATH);

const projects = [
  {
    title: 'North Macedonia welcomes new highway',
    slug: 'north-macedonia-welcomes-new-highway',
    description: 'Major transport hub connecting regions through visionary civil engineering.',
    full_content: `<h2 class="display-title small" style="color: #000; margin-bottom: 20px;">Engineering a Regional Connection</h2>
<p class="lead-text">A masterpiece of modern civil engineering, the North Macedonia welcomes new highway stands as a testament to technical precision and strategic infrastructure development.</p>
<p>Overcoming complex geographical challenges, our team implemented advanced cantilever construction methods to bridge the valley without disrupting the sensitive local ecosystem. This project marks a significant milestone in our commitment to connecting Southeast Europe through visionary engineering.</p>`,
    image: '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841226132.png',
    gallery: JSON.stringify([
      '/images/projektet/WhatsApp Image 2026-03-30 at 13.48.58 (6).png',
      '/images/projektet/WhatsApp Image 2026-03-30 at 13.48.59 (8).png',
      '/images/projektet/WhatsApp Image 2026-03-30 at 13.49.00 (4).png',
      '/images/projektet/WhatsApp Image 2026-03-30 at 13.49.07 (5).png',
      '/images/projektet/WhatsApp Image 2026-03-30 at 13.49.08.png',
      '/images/projektet/WhatsApp Image 2026-03-30 at 13.49.09 (2).png',
      '/images/projektet/WhatsApp Image 2026-03-30 at 13.49.10 (1).png',
      '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841217730.png',
      '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841218675.png'
    ]),
    category: 'Infrastructure',
    location: 'North Macedonia / Albania Border',
    country: 'macedonia',
    project_type: 'design-build',
    card_size: 'featured',
    status: 'Completed 2023',
    scale: '800m Span | 120m Height',
    client: 'Regional Transport Authority',
    spec_steel: '12k',
    spec_concrete: '45k',
    spec_incidents: '0',
    sort_order: 1
  },
  {
    title: 'Prishtina Business Hub',
    slug: 'prishtina-business-hub',
    description: 'Civil engineering and commercial development hub in the capital.',
    full_content: `<h2 class="display-title small" style="color: #000; margin-bottom: 20px;">Urban Commercial Landmark</h2>
<p class="lead-text">Prishtina Business Hub is positioned as a flagship civil engineering development that supports modern business growth in Kosovo.</p>
<p>The project integrates structural efficiency, contemporary facade systems, and infrastructure-ready utility planning to deliver long-term operational value.</p>`,
    image: '/images/projektet/WhatsApp Image 2026-03-30 at 13.48.58 (6).png',
    gallery: JSON.stringify([
      '/images/projektet/WhatsApp Image 2026-03-30 at 13.48.58 (6).png',
      '/images/projektet/WhatsApp Image 2026-03-30 at 13.48.59 (8).png',
      '/images/projektet/WhatsApp Image 2026-03-30 at 13.49.00 (4).png'
    ]),
    category: 'Civil Engineering',
    location: 'PRISHTINA, KOSOVO',
    country: 'kosovo',
    project_type: 'construction-management',
    card_size: 'small',
    status: 'In Progress',
    scale: 'Mixed-Use Commercial Development',
    client: 'Private & Institutional Stakeholders',
    spec_steel: '',
    spec_concrete: '',
    spec_incidents: '',
    sort_order: 2
  },
  {
    title: 'Regional Water Plant',
    slug: 'regional-water-plant',
    description: 'Regional environmental project focused on resilient water treatment capacity.',
    full_content: `<h2 class="display-title small" style="color: #000; margin-bottom: 20px;">Critical Water Infrastructure</h2>
<p class="lead-text">The Regional Water Plant is designed to strengthen municipal and regional water treatment performance through modern environmental engineering.</p>
<p>Its process design supports dependable treatment output, higher operational safety, and sustainable long-term service for surrounding communities.</p>`,
    image: '/images/projektet/WhatsApp Image 2026-03-30 at 13.48.59 (8).png',
    gallery: JSON.stringify([
      '/images/projektet/WhatsApp Image 2026-03-30 at 13.48.59 (8).png',
      '/images/projektet/WhatsApp Image 2026-03-30 at 13.49.08.png',
      '/images/projektet/WhatsApp Image 2026-03-30 at 13.49.09 (2).png'
    ]),
    category: 'Environment',
    location: 'KOSOVO',
    country: 'kosovo',
    project_type: 'epc',
    card_size: 'small',
    status: 'Delivered',
    scale: 'Regional Treatment Capacity Upgrade',
    client: 'Public Utilities Authority',
    spec_steel: '',
    spec_concrete: '',
    spec_incidents: '',
    sort_order: 3
  },
  {
    title: 'City Boulevard Expansion',
    slug: 'city-boulevard-expansion',
    description: 'Modernizing city centers with sustainable infrastructure and smart design.',
    full_content: `<h2 class="display-title small" style="color: #000; margin-bottom: 20px;">Smart Urban Connectivity</h2>
<p class="lead-text">City Boulevard Expansion modernizes core urban corridors to improve mobility, safety, and public space quality.</p>
<p>The intervention combines durable roadworks, integrated pedestrian planning, and utility coordination to support future city growth.</p>`,
    image: '/images/projektet/WhatsApp Image 2026-03-30 at 13.49.00 (4).png',
    gallery: JSON.stringify([
      '/images/projektet/WhatsApp Image 2026-03-30 at 13.49.00 (4).png',
      '/images/projektet/WhatsApp Image 2026-03-30 at 13.49.07 (5).png',
      '/images/projektet/WhatsApp Image 2026-03-30 at 13.49.10 (1).png'
    ]),
    category: 'Urban Planning',
    location: 'PRISHTINA, KOSOVO',
    country: 'kosovo',
    project_type: 'turnkey',
    card_size: 'landscape',
    status: 'Ongoing',
    scale: 'City Boulevard Modernization',
    client: 'Municipal Infrastructure Authority',
    spec_steel: '',
    spec_concrete: '',
    spec_incidents: '',
    sort_order: 4
  },
  {
    title: 'Pumping Stations',
    slug: 'pumping-stations',
    description: 'Advanced water management systems for regional agricultural and urban needs.',
    full_content: `<h2 class="display-title small" style="color: #000; margin-bottom: 20px;">Water Management Reliability</h2>
<p class="lead-text">The Pumping Stations project improves water distribution resilience for agricultural and urban consumption areas.</p>
<p>System upgrades focus on stable hydraulic performance, operational continuity, and reduced service interruptions.</p>`,
    image: '/images/projektet/WhatsApp Image 2026-03-30 at 13.49.08.png',
    gallery: JSON.stringify([
      '/images/projektet/WhatsApp Image 2026-03-30 at 13.49.08.png',
      '/images/projektet/WhatsApp Image 2026-03-30 at 13.49.09 (2).png',
      '/images/projektet/WhatsApp Image 2026-03-30 at 13.49.10 (1).png'
    ]),
    category: 'Water & Environment',
    location: 'KOSOVO',
    country: 'kosovo',
    project_type: 'design-build',
    card_size: 'featured',
    status: 'Delivered',
    scale: 'Regional Pumping Network',
    client: 'Regional Water Operator',
    spec_steel: '',
    spec_concrete: '',
    spec_incidents: '',
    sort_order: 5
  },
  {
    title: 'Project Site Technical Review',
    slug: 'project-site-technical-review',
    description: 'On-site technical inspection framework ensuring quality and execution control.',
    full_content: `<h2 class="display-title small" style="color: #000; margin-bottom: 20px;">Execution Quality Assurance</h2>
<p class="lead-text">Project Site Technical Review captures field verification, engineering conformity checks, and progress validation across active worksites.</p>
<p>The review process supports safer delivery, issue prevention, and transparent reporting for all project stakeholders.</p>`,
    image: '/images/projektet/WhatsApp Image 2026-03-30 at 13.49.09 (2).png',
    gallery: JSON.stringify([
      '/images/projektet/WhatsApp Image 2026-03-30 at 13.49.09 (2).png',
      '/images/projektet/WhatsApp Image 2026-03-30 at 13.49.08.png',
      '/images/projektet/WhatsApp Image 2026-03-30 at 13.49.00 (4).png'
    ]),
    category: 'Site Inspection',
    location: 'WESTERN BALKANS',
    country: 'see',
    project_type: 'construction-management',
    card_size: 'small',
    status: 'Continuous Program',
    scale: 'Multi-Site Oversight',
    client: 'Internal & Client PMO Teams',
    spec_steel: '',
    spec_concrete: '',
    spec_incidents: '',
    sort_order: 6
  },
  {
    title: 'Regional Leadership Visit',
    slug: 'regional-leadership-visit',
    description: 'High-level project engagement demonstrating strategic partnerships and transparency.',
    full_content: `<h2 class="display-title small" style="color: #000; margin-bottom: 20px;">Stakeholder Alignment in the Field</h2>
<p class="lead-text">Regional Leadership Visit documents executive and institutional engagement on active infrastructure sites.</p>
<p>These visits reinforce cross-border collaboration, delivery confidence, and long-term strategic project alignment.</p>`,
    image: '/images/projektet/WhatsApp Image 2026-03-30 at 13.49.10 (1).png',
    gallery: JSON.stringify([
      '/images/projektet/WhatsApp Image 2026-03-30 at 13.49.10 (1).png',
      '/images/projektet/WhatsApp Image 2026-03-30 at 13.49.09 (2).png',
      '/images/projektet/WhatsApp Image 2026-03-30 at 13.49.07 (5).png'
    ]),
    category: 'Public Relations',
    location: 'WESTERN BALKANS',
    country: 'see',
    project_type: 'turnkey',
    card_size: 'small',
    status: 'Completed Visits',
    scale: 'Regional Program Sites',
    client: 'Government & Funding Stakeholders',
    spec_steel: '',
    spec_concrete: '',
    spec_incidents: '',
    sort_order: 7
  }
];

const news = [
  {
    title: '2xAR Awarded Contract for Regional Corridor VIII Expansion',
    slug: '2xar-awarded-contract-for-regional-corridor-viii-expansion',
    excerpt: 'PRISHTINA, KOSOVO — 2xAR, a regional leader in heavy infrastructure and civil engineering, is proud to announce it has been officially awarded the contract for the modernization and expansion of a critical section of the Corridor VIII highway.',
    content: `<p><strong>PRISHTINA, KOSOVO</strong> — 2xAR, a regional leader in heavy infrastructure and civil engineering, is proud to announce it has been officially awarded the contract for the modernization and expansion of a critical section of the Corridor VIII highway. This €140 million project represents a significant milestone in regional transport integration and infrastructure development across the Western Balkans.</p>
<p>The contract covers the complex technical expansion of the 12-kilometer section connecting the regional hubs, including the construction of two major viaducts and a series of advanced drainage systems designed to meet the highest European sustainability standards.</p>
<blockquote class="article-quote">This project is more than just asphalt and concrete. It is about connectivity and the future of economic growth in Southeast Europe. 2xAR is committed to delivering this with the precision and excellence our legacy is built upon.</blockquote>
<h2>Engineering for the Next Decade</h2>
<p>Our technical team will implement state-of-the-art structural monitoring systems throughout the construction phase. This includes real-time telemetry markers for the viaduct foundation pours and the use of eco-certified materials designed to reduce the project's long-term environmental footprint.</p>
<p>Construction is scheduled to begin in late Q2 2024, with over 400 specialized local engineers and site managers expected to be deployed at the height of the works.</p>
<h2>Strengthening Strategic Alliances</h2>
<p>The project will be executed in collaboration with our global industry partners, leveraging internal high-capacity machinery and the latest in digital project management (BIM) to ensure strict adherence to timelines and safety protocols.</p>`,
    image: '/images/hero_bridge_1770233612287.png',
    category: 'Strategic Project',
    location: 'PRISHTINA, KOSOVO',
    date: '2024-03-15',
    sort_order: 1
  },
  {
    title: '2xAR Awarded Major Environmental Infrastructure Contract in Kosovo',
    slug: '2xar-awarded-major-environmental-infrastructure-contract-in-kosovo',
    excerpt: 'PRISHTINA, KOSOVO — 2xAR has been awarded a landmark €40 million contract for the development of a national landfill and waste management system in Kosovo.',
    content: '<p>PRISHTINA, KOSOVO — 2xAR has been awarded a landmark €40 million contract for the development of a national landfill and waste management system in Kosovo.</p>',
    image: '/Fotot per News&Insights/1 Landfill.webp',
    category: 'Announcement',
    location: 'PRISHTINA, KOSOVO',
    date: '',
    sort_order: 2
  },
  {
    title: '2xAR Secures €53.4M Contract for Strategic Transport Corridor',
    slug: '2xar-secures-53-4m-contract-for-strategic-transport-corridor',
    excerpt: 'BERANE, MONTENEGRO — 2xAR has been awarded a €53.4 million contract for the development of a key section of the Berane–Rozhaje corridor, a project of strategic importance for regional connectivity.',
    content: '<p>BERANE, MONTENEGRO — 2xAR has been awarded a €53.4 million contract for the development of a key section of the Berane–Rozhaje corridor, a project of strategic importance for regional connectivity.</p>',
    image: '/Fotot per News&Insights/2. Berane – Rozhaje Corridor.png',
    category: 'Announcement',
    location: 'BERANE, MONTENEGRO',
    date: '',
    sort_order: 3
  },
  {
    title: '2xAR Advances €32.5M Infrastructure Development in Shtip',
    slug: '2xar-advances-32-5m-infrastructure-development-in-shtip',
    excerpt: 'SHTIP, NORTH MACEDONIA — 2xAR is leading the development of a €32.5 million infrastructure project in Shtip, focused on upgrading urban systems and utility networks.',
    content: '<p>SHTIP, NORTH MACEDONIA — 2xAR is leading the development of a €32.5 million infrastructure project in Shtip, focused on upgrading urban systems and utility networks.</p>',
    image: '/Fotot per News&Insights/3, Shtip Infrastructure Project.jpg',
    category: 'Announcement',
    location: 'SHTIP, NORTH MACEDONIA',
    date: '',
    sort_order: 4
  },
  {
    title: '2xAR Delivers €23M Infrastructure Upgrade in Tetovo',
    slug: '2xar-delivers-23m-infrastructure-upgrade-in-tetovo',
    excerpt: 'TETOVO, NORTH MACEDONIA — 2xAR is executing a €23 million infrastructure development project in Tetovo, focused on strengthening urban connectivity and public infrastructure.',
    content: '<p>TETOVO, NORTH MACEDONIA — 2xAR is executing a €23 million infrastructure development project in Tetovo, focused on strengthening urban connectivity and public infrastructure.</p>',
    image: '/Fotot per News&Insights/4. Tetovo Infrastructure Project.jpg',
    category: 'Announcement',
    location: 'TETOVO, NORTH MACEDONIA',
    date: '',
    sort_order: 5
  },
  {
    title: '2xAR Awarded €13M Infrastructure Contract in Mojkovac',
    slug: '2xar-awarded-13m-infrastructure-contract-in-mojkovac',
    excerpt: 'MOJKOVAC, MONTENEGRO — 2xAR has secured a €13 million contract for infrastructure development in Mojkovac, contributing to regional connectivity and economic growth.',
    content: '<p>MOJKOVAC, MONTENEGRO — 2xAR has secured a €13 million contract for infrastructure development in Mojkovac, contributing to regional connectivity and economic growth.</p>',
    image: '/Fotot per News&Insights/6, MOJKOVAC, MONTENEGRO.jpg',
    category: 'Announcement',
    location: 'MOJKOVAC, MONTENEGRO',
    date: '',
    sort_order: 6
  },
  {
    title: '2xAR Expands Water Infrastructure in Vitia with €6.5M Project',
    slug: '2xar-expands-water-infrastructure-in-vitia-with-6-5m-project',
    excerpt: 'VITI, KOSOVO — 2xAR is delivering a €6.5 million water infrastructure project in Viti, aimed at improving water supply systems and supporting sustainable development.',
    content: '<p>VITI, KOSOVO — 2xAR is delivering a €6.5 million water infrastructure project in Viti, aimed at improving water supply systems and supporting sustainable development.</p>',
    image: '/Fotot per News&Insights/6. Vitia.jpg',
    category: 'Announcement',
    location: 'VITI, KOSOVO',
    date: '',
    sort_order: 7
  },
  {
    title: '2xAR Implements Environmental Infrastructure Project in Mavrovo',
    slug: '2xar-implements-environmental-infrastructure-project-in-mavrovo',
    excerpt: 'MAVROVO, NORTH MACEDONIA — 2xAR is delivering a €2.4 million environmental infrastructure project in Mavrovo, focused on sustainability and ecological protection.',
    content: '<p>MAVROVO, NORTH MACEDONIA — 2xAR is delivering a €2.4 million environmental infrastructure project in Mavrovo, focused on sustainability and ecological protection.</p>',
    image: '/Fotot per News&Insights/7. Mavrovo.jpg',
    category: 'Announcement',
    location: 'MAVROVO, NORTH MACEDONIA',
    date: '',
    sort_order: 8
  }
];

/** Partner logos live under `public/images/partners/` — paths are web-root absolute */
const partners = [
  { name: 'Guangxi Road Construction', logo: '/images/partners/guangxi_road.jpg', sort_order: 1 },
  { name: 'Xingtai Road & Bridge', logo: '/images/partners/xingtai_road.png', sort_order: 2 },
  { name: 'MESOGEOS S.A.', logo: '/images/partners/mesogeos.png', sort_order: 3 },
  { name: 'China Railway', logo: '/images/partners/cr.png', sort_order: 4 },
  { name: 'T.T.Ş-inşaat', logo: '/images/partners/tts_insaat.png', sort_order: 5 },
  { name: 'ARIKAN Construction', logo: '/images/partners/arikan.jpg', sort_order: 6 },
  { name: 'KARKANIAS Environmental', logo: '/images/partners/karkanias.png', sort_order: 7 },
  { name: 'EREN INSAAT', logo: '/images/partners/eren_insaat.png', sort_order: 8 },
  { name: 'Greenline', logo: '/images/partners/greenline.jpg', sort_order: 9 },
  { name: 'Vestan Insaat', logo: '/images/partners/vestan.jpg', sort_order: 10 },
  { name: 'LA DRAGAGGI', logo: '/images/partners/la_dragaggi.png', sort_order: 11 },
  { name: 'STENTON GRADBA', logo: '/images/partners/stenton_gradba.jpg', sort_order: 12 },
  { name: 'METAG HOLDING', logo: '/images/partners/metag.png', sort_order: 13 },
  { name: 'Artemis Aritma', logo: '/images/partners/artemis.png', sort_order: 14 },
  { name: 'AK INVEST', logo: '/images/partners/ak_invest.png', sort_order: 15 },
  { name: 'Environmental Partner', logo: '/images/partners/stacked_disks.png', sort_order: 16 }
];

const careers = [
  {
    title: 'Project Manager',
    slug: 'project-manager',
    location: 'Western Balkans',
    department: 'Engineering',
    employment_type: 'Full Time',
    overview: 'We are seeking an experienced Project Manager to lead the delivery of complex infrastructure and construction projects across Southeast Europe, ensuring execution aligned with technical, contractual, and financial objectives.',
    responsibilities: 'Manage full project lifecycle from planning to delivery\nControl budgets, timelines, and resources\nCoordinate multidisciplinary teams and stakeholders\nEnsure compliance with contracts, standards, and regulations\nReport on progress, risks, and performance',
    experience: '8-15+ years in construction or infrastructure projects\nProven experience managing projects €10M-€50M+\nExperience with EU/IFI-funded projects is highly preferred',
    qualifications: 'Degree in Civil Engineering or related field\nPMP, FIDIC, or equivalent certification (preferred)\nStrong knowledge of project management tools and contracts',
    sort_order: 1
  },
  {
    title: 'Site Engineer',
    slug: 'site-engineer',
    location: 'Western Balkans',
    department: 'Engineering',
    employment_type: 'Full Time',
    overview: 'We are seeking a Site Engineer to support on-site execution and ensure all works are delivered according to design, quality standards, and timelines.',
    responsibilities: 'Supervise construction works and site activities\nEnsure alignment with technical drawings and specifications\nCoordinate subcontractors and suppliers\nMonitor quality and progress\nSupport issue resolution on-site',
    experience: '3-8 years in construction or infrastructure projects\nExperience on medium to large construction sites',
    qualifications: 'Degree in Civil Engineering\nStrong knowledge of construction processes and drawings\nFamiliarity with site documentation and reporting',
    sort_order: 2
  },
  {
    title: 'Surveyor Engineer',
    slug: 'surveyor-engineer',
    location: 'Western Balkans',
    department: 'Engineering',
    employment_type: 'Full Time',
    overview: 'We are seeking a Surveyor Engineer to ensure precision in measurement, alignment, and positioning across all project phases.',
    responsibilities: 'Perform topographic and construction surveys\nSet out works and verify alignment\nPrepare survey reports and documentation\nUse GPS, total stations, and modern surveying tools\nMonitor deviations and ensure accuracy',
    experience: '3-7 years in construction surveying\nExperience in infrastructure projects preferred',
    qualifications: 'Degree or certification in Surveying or Geodesy\nProficiency with surveying equipment and software',
    sort_order: 3
  },
  {
    title: 'Cost Engineer',
    slug: 'cost-engineer',
    location: 'Western Balkans',
    department: 'Finance',
    employment_type: 'Full Time',
    overview: 'We are seeking a Cost Engineer to manage budgeting, cost control, and financial performance of projects.',
    responsibilities: 'Prepare cost estimates and budgets\nMonitor project costs and financial performance\nManage variations, claims, and valuations\nSupport tender pricing\nEnsure cost efficiency',
    experience: '5-10 years in cost control or quantity surveying\nExperience with infrastructure or civil projects',
    qualifications: 'Degree in Civil Engineering, Construction Management, or Finance\nStrong Excel and cost management tools skills',
    sort_order: 4
  },
  {
    title: 'Electrical Engineer',
    slug: 'electrical-engineer',
    location: 'Western Balkans',
    department: 'Engineering',
    employment_type: 'Full Time',
    overview: 'We are seeking an Electrical Engineer to design and oversee electrical systems in infrastructure and energy projects.',
    responsibilities: 'Design and supervise electrical systems\nEnsure compliance with standards\nOversee installation and commissioning\nCoordinate with project teams\nTroubleshoot and optimize systems',
    experience: '5-10 years in electrical engineering projects\nExperience in infrastructure or energy sector preferred',
    qualifications: 'Degree in Electrical Engineering\nKnowledge of EU standards and power systems',
    sort_order: 5
  },
  {
    title: 'Mechanical Engineer',
    slug: 'mechanical-engineer',
    location: 'Western Balkans',
    department: 'Engineering',
    employment_type: 'Full Time',
    overview: 'We are seeking a Mechanical Engineer to support design and execution of mechanical systems in infrastructure and environmental projects.',
    responsibilities: 'Design and oversee mechanical systems\nSupervise installation and commissioning\nEnsure compliance with standards\nSupport system optimization\nPrepare technical documentation',
    experience: '5-10 years in mechanical engineering\nExperience in water, wastewater, or industrial systems preferred',
    qualifications: 'Degree in Mechanical Engineering\nKnowledge of pumps, pipelines, and treatment systems',
    sort_order: 6
  },
  {
    title: 'Environmental Expert',
    slug: 'environmental-expert',
    location: 'Western Balkans',
    department: 'HSE',
    employment_type: 'Full Time',
    overview: 'We are seeking an Environmental Expert to ensure projects meet environmental standards and sustainability requirements.',
    responsibilities: 'Conduct environmental impact assessments\nEnsure compliance with EU and local regulations\nDevelop environmental management plans\nMonitor environmental performance\nLiaise with authorities and stakeholders',
    experience: '5-10 years in environmental engineering or consulting\nExperience with EU-funded projects highly preferred',
    qualifications: 'Degree in Environmental Engineering or related field\nKnowledge of EU environmental directives',
    sort_order: 7
  }
];

const tx = db.transaction(() => {
  db.prepare('DELETE FROM projects').run();
  db.prepare('DELETE FROM news').run();
  db.prepare('DELETE FROM careers').run();
  db.prepare('DELETE FROM partners').run();

  const insertProject = db.prepare(`
    INSERT INTO projects (
      title, slug, description, full_content, image, gallery, category, location, country, project_type, card_size,
      status, scale, client, spec_steel, spec_concrete, spec_incidents, is_published, is_featured, sort_order
    ) VALUES (
      @title, @slug, @description, @full_content, @image, @gallery, @category, @location, @country, @project_type, @card_size,
      @status, @scale, @client, @spec_steel, @spec_concrete, @spec_incidents, 1, 0, @sort_order
    )
  `);
  projects.forEach((p) => insertProject.run(p));

  const insertNews = db.prepare(`
    INSERT INTO news (
      title, slug, excerpt, content, image, gallery, category, location, date, is_published, is_featured, sort_order
    ) VALUES (
      @title, @slug, @excerpt, @content, @image, '[]', @category, @location, @date, 1, 0, @sort_order
    )
  `);
  news.forEach((n) => insertNews.run(n));

  const insertCareer = db.prepare(`
    INSERT INTO careers (
      title, slug, location, department, employment_type, overview, responsibilities, experience, qualifications, is_published, sort_order
    ) VALUES (
      @title, @slug, @location, @department, @employment_type, @overview, @responsibilities, @experience, @qualifications, 1, @sort_order
    )
  `);
  careers.forEach((c) => insertCareer.run(c));

  const insertPartner = db.prepare(`
    INSERT INTO partners (name, logo, sort_order, is_published)
    VALUES (@name, @logo, @sort_order, 1)
  `);
  partners.forEach((p) => insertPartner.run(p));

  const upsertSetting = db.prepare(`
    INSERT INTO settings (key, value, type, label, category)
    VALUES (@key, @value, 'text', @label, 'stats')
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
  `);
  const homepageStats = [
    { key: 'stat_flagship_projects', value: '150+', label: 'Home showcase — completed projects' },
    { key: 'stat_regional_impact_eur', value: '350M', label: 'Home showcase — regional impact (€)' }
  ];
  for (const s of homepageStats) upsertSetting.run(s);
});

tx();

const counts = {
  projects: db.prepare('SELECT COUNT(*) as count FROM projects').get().count,
  news: db.prepare('SELECT COUNT(*) as count FROM news').get().count,
  careers: db.prepare('SELECT COUNT(*) as count FROM careers').get().count,
  partners: db.prepare('SELECT COUNT(*) as count FROM partners').get().count
};

console.log('Live content sync complete:', counts);
