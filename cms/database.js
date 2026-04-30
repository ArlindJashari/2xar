import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, 'cms.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ──────────────────────────────────────────────────
export function initDatabase() {
  db.exec(`
    -- Admin users
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      display_name TEXT NOT NULL DEFAULT 'Admin',
      role TEXT NOT NULL DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- News / Insights articles
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT,
      content TEXT,
      image TEXT,
      category TEXT DEFAULT 'Announcement',
      location TEXT,
      date TEXT,
      is_published INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Projects
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      full_content TEXT,
      image TEXT,
      category TEXT DEFAULT 'Infrastructure',
      location TEXT,
      country TEXT,
      project_type TEXT,
      value TEXT,
      card_size TEXT DEFAULT 'small',
      is_published INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Careers / Job openings
    CREATE TABLE IF NOT EXISTS careers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      location TEXT DEFAULT 'Western Balkans',
      department TEXT DEFAULT 'Engineering',
      employment_type TEXT DEFAULT 'Full Time',
      overview TEXT,
      responsibilities TEXT,
      experience TEXT,
      qualifications TEXT,
      is_published INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Partners / Clients logos
    CREATE TABLE IF NOT EXISTS partners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      logo TEXT,
      website TEXT,
      is_published INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Site settings (key-value store)
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      type TEXT DEFAULT 'text',
      label TEXT,
      category TEXT DEFAULT 'general',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Hero slides
    CREATE TABLE IF NOT EXISTS hero_slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      subtitle TEXT,
      description TEXT,
      video_url TEXT,
      cta_text TEXT DEFAULT 'View Our Projects',
      cta_link TEXT DEFAULT '/projects',
      is_published INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default admin if none exists
  const adminExists = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (adminExists.count === 0) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (username, password, display_name, role) VALUES (?, ?, ?, ?)
    `).run('admin', hashedPassword, '2XAR Admin', 'admin');
    console.log('✓ Default admin created (admin / admin123)');
  }

  // Seed default settings if none exist
  const settingsExist = db.prepare('SELECT COUNT(*) as count FROM settings').get();
  if (settingsExist.count === 0) {
    const defaultSettings = [
      ['site_name', '2XAR', 'text', 'Site Name', 'general'],
      ['site_tagline', 'Construction & Infrastructure', 'text', 'Tagline', 'general'],
      ['contact_email', 'info@2xar.global', 'text', 'Contact Email', 'contact'],
      ['hr_email', 'hr@2xar.global', 'text', 'HR Email', 'contact'],
      ['address', 'Ilir Durmishi str. 2, floor 3, no. 11, 10000 Prishtina, Kosovo', 'text', 'Address', 'contact'],
      ['website', 'www.2xar.global', 'text', 'Website URL', 'contact'],
      ['instagram_url', '#', 'text', 'Instagram URL', 'social'],
      ['linkedin_url', '#', 'text', 'LinkedIn URL', 'social'],
      ['about_heading', 'Engineering The Future Landmarks', 'text', 'About Section Heading', 'homepage'],
      ['about_text_1', '2XAR represents the intersection of technical precision and visionary engineering. We operate across four core sectors: Buildings, Infrastructure, Water, and Roads - delivering complex projects that power regional economies and shape the built environment of Southeast Europe.', 'textarea', 'About Text Paragraph 1', 'homepage'],
      ['about_text_2', 'With headquarters in Prishtina, and offices in Tirana, Podgorica, and Skopje, 2XAR brings together a team with extensive experience developed over three decades across multiple sectors and geographies, including Southeast and Western Europe.', 'textarea', 'About Text Paragraph 2', 'homepage'],
      ['stat_projects', '150+', 'text', 'Projects Stat', 'stats'],
      ['stat_experience', '25+', 'text', 'Experience Stat', 'stats'],
      ['stat_countries', '8+', 'text', 'Countries Stat', 'stats'],
      ['stat_partners', '50+', 'text', 'Partners Stat', 'stats'],
      ['partners_description', 'Our network spans across Italy, Germany, Greece, Turkiye, Azerbaijan, Lebanon, Kuwait, China, India, North Macedonia, Albania, Croatia, etc.', 'textarea', 'Partners Description', 'homepage'],
      ['ifi_partners', 'EBRD, EIB, World Bank, EU funds, KfW, Saudi Fund, Islamic Development Bank, WBIF, etc.', 'textarea', 'IFI Partners', 'homepage'],
    ];

    const insertSetting = db.prepare('INSERT INTO settings (key, value, type, label, category) VALUES (?, ?, ?, ?, ?)');
    for (const s of defaultSettings) {
      insertSetting.run(...s);
    }
    console.log('✓ Default settings seeded');
  }

  // Seed news articles if none exist
  const newsExist = db.prepare('SELECT COUNT(*) as count FROM news').get();
  if (newsExist.count === 0) {
    const newsItems = [
      {
        title: '2xAR Awarded Major Environmental Infrastructure Contract in Kosovo',
        slug: '2xar-environmental-infrastructure-kosovo',
        excerpt: '2xAR has been awarded a landmark €40 million contract for the development of a national landfill and waste management system in Kosovo.',
        content: '<p><strong>PRISHTINA, KOSOVO</strong> — 2xAR has been awarded a landmark €40 million contract for the development of a national landfill and waste management system in Kosovo. This environmental infrastructure project represents a significant step forward in the country\'s waste management capabilities and environmental protection efforts.</p><p>The project encompasses the design and construction of state-of-the-art landfill facilities, including advanced leachate treatment systems, methane capture infrastructure, and comprehensive waste sorting and recycling capabilities.</p>',
        image: '/Fotot per News&Insights/1 Landfill.webp',
        category: 'Environmental',
        location: 'PRISHTINA, KOSOVO',
        date: '2026-03-15',
        sort_order: 1
      },
      {
        title: '2xAR Secures €53.4M Contract for Strategic Transport Corridor',
        slug: '2xar-berane-rozhaje-corridor',
        excerpt: '2xAR has been awarded a €53.4 million contract for the development of a key section of the Berane–Rozhaje corridor in Montenegro.',
        content: '<p><strong>BERANE, MONTENEGRO</strong> — 2xAR has been awarded a €53.4 million contract for the development of a key section of the Berane–Rozhaje corridor, a project of strategic importance for regional connectivity.</p>',
        image: '/Fotot per News&Insights/2. Berane – Rozhaje Corridor.png',
        category: 'Infrastructure',
        location: 'BERANE, MONTENEGRO',
        date: '2026-02-28',
        sort_order: 2
      },
      {
        title: '2xAR Advances €32.5M Infrastructure Development in Shtip',
        slug: '2xar-shtip-infrastructure',
        excerpt: '2xAR is leading the development of a €32.5 million infrastructure project in Shtip, focused on upgrading urban systems and utility networks.',
        content: '<p><strong>SHTIP, NORTH MACEDONIA</strong> — 2xAR is leading the development of a €32.5 million infrastructure project in Shtip, focused on upgrading urban systems and utility networks.</p>',
        image: '/Fotot per News&Insights/3, Shtip Infrastructure Project.jpg',
        category: 'Infrastructure',
        location: 'SHTIP, NORTH MACEDONIA',
        date: '2026-02-10',
        sort_order: 3
      },
      {
        title: '2xAR Delivers €23M Infrastructure Upgrade in Tetovo',
        slug: '2xar-tetovo-infrastructure',
        excerpt: '2xAR is executing a €23 million infrastructure development project in Tetovo, focused on strengthening urban connectivity.',
        content: '<p><strong>TETOVO, NORTH MACEDONIA</strong> — 2xAR is executing a €23 million infrastructure development project in Tetovo, focused on strengthening urban connectivity and public infrastructure.</p>',
        image: '/Fotot per News&Insights/4. Tetovo Infrastructure Project.jpg',
        category: 'Infrastructure',
        location: 'TETOVO, NORTH MACEDONIA',
        date: '2026-01-20',
        sort_order: 4
      },
      {
        title: '2xAR Awarded €13M Infrastructure Contract in Mojkovac',
        slug: '2xar-mojkovac-infrastructure',
        excerpt: '2xAR has secured a €13 million contract for infrastructure development in Mojkovac.',
        content: '<p><strong>MOJKOVAC, MONTENEGRO</strong> — 2xAR has secured a €13 million contract for infrastructure development in Mojkovac, contributing to regional connectivity and economic growth.</p>',
        image: '/Fotot per News&Insights/6, MOJKOVAC, MONTENEGRO.jpg',
        category: 'Infrastructure',
        location: 'MOJKOVAC, MONTENEGRO',
        date: '2025-12-15',
        sort_order: 5
      },
      {
        title: '2xAR Expands Water Infrastructure in Vitia with €6.5M Project',
        slug: '2xar-vitia-water-infrastructure',
        excerpt: '2xAR is delivering a €6.5 million water infrastructure project in Viti.',
        content: '<p><strong>VITI, KOSOVO</strong> — 2xAR is delivering a €6.5 million water infrastructure project in Viti, aimed at improving water supply systems and supporting sustainable development.</p>',
        image: '/Fotot per News&Insights/6. Vitia.jpg',
        category: 'Water & Environment',
        location: 'VITI, KOSOVO',
        date: '2025-11-01',
        sort_order: 6
      },
      {
        title: '2xAR Implements Environmental Infrastructure Project in Mavrovo',
        slug: '2xar-mavrovo-environmental',
        excerpt: '2xAR is delivering a €2.4 million environmental infrastructure project in Mavrovo.',
        content: '<p><strong>MAVROVO, NORTH MACEDONIA</strong> — 2xAR is delivering a €2.4 million environmental infrastructure project in Mavrovo, focused on sustainability and ecological protection.</p>',
        image: '/Fotot per News&Insights/7. Mavrovo.jpg',
        category: 'Environmental',
        location: 'MAVROVO, NORTH MACEDONIA',
        date: '2025-10-01',
        sort_order: 7
      },
    ];

    const insertNews = db.prepare(`
      INSERT INTO news (title, slug, excerpt, content, image, category, location, date, sort_order)
      VALUES (@title, @slug, @excerpt, @content, @image, @category, @location, @date, @sort_order)
    `);

    for (const item of newsItems) {
      insertNews.run(item);
    }
    console.log('✓ News articles seeded');
  }

  // Seed projects if none exist
  const projectsExist = db.prepare('SELECT COUNT(*) as count FROM projects').get();
  if (projectsExist.count === 0) {
    const projectItems = [
      {
        title: 'North Macedonia welcomes new highway',
        slug: 'north-macedonia-highway',
        description: 'Major transport hub connecting regions through visionary civil engineering.',
        full_content: '<p>Engineering massive connections across complex terrains with unparalleled precision.</p>',
        image: '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841226132.png',
        category: 'Infrastructure',
        location: 'ALBANIA / MKD',
        country: 'macedonia',
        project_type: 'design-build',
        card_size: 'featured',
        sort_order: 1
      },
      {
        title: 'Prishtina Business Hub',
        slug: 'prishtina-business-hub',
        description: 'Modern commercial complex in the heart of the capital.',
        image: '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841227120.png',
        category: 'Civil Engineering',
        location: 'PRISHTINA, KOSOVO',
        country: 'kosovo',
        card_size: 'small',
        sort_order: 2
      },
      {
        title: 'Regional Water Plant',
        slug: 'regional-water-plant',
        description: 'Advanced water treatment facility serving multiple municipalities.',
        image: '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841230737.png',
        category: 'Environment',
        location: 'KOSOVO',
        country: 'kosovo',
        card_size: 'small',
        sort_order: 3
      },
      {
        title: 'City Boulevard Expansion',
        slug: 'city-boulevard-expansion',
        description: 'Modernizing city centers with sustainable infrastructure and smart design.',
        image: '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841231795.png',
        category: 'Urban Planning',
        location: 'PRISHTINA, KOSOVO',
        country: 'kosovo',
        card_size: 'landscape',
        sort_order: 4
      },
      {
        title: 'Pumping Stations',
        slug: 'pumping-stations',
        description: 'Advanced water management systems for regional agricultural and urban needs.',
        image: '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841240652.png',
        category: 'Water & Environment',
        location: 'KOSOVO',
        country: 'kosovo',
        card_size: 'featured',
        sort_order: 5
      },
      {
        title: 'Project Site Technical Review',
        slug: 'site-technical-review',
        description: 'Comprehensive site inspection and quality assurance processes.',
        image: '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841217730.png',
        category: 'Site Inspection',
        location: 'WESTERN BALKANS',
        card_size: 'small',
        sort_order: 6
      },
      {
        title: 'Regional Leadership Visit',
        slug: 'regional-leadership-visit',
        description: 'High-profile visits to our major project sites.',
        image: '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841218675.png',
        category: 'Public Relations',
        location: 'WESTERN BALKANS',
        card_size: 'small',
        sort_order: 7
      },
    ];

    const insertProject = db.prepare(`
      INSERT INTO projects (title, slug, description, full_content, image, category, location, country, project_type, card_size, sort_order)
      VALUES (@title, @slug, @description, @full_content, @image, @category, @location, @country, @project_type, @card_size, @sort_order)
    `);

    for (const item of projectItems) {
      insertProject.run({
        full_content: null,
        project_type: null,
        country: null,
        ...item
      });
    }
    console.log('✓ Projects seeded');
  }

  // Seed careers if none exist
  const careersExist = db.prepare('SELECT COUNT(*) as count FROM careers').get();
  if (careersExist.count === 0) {
    const careerItems = [
      { title: 'Project Manager', slug: 'project-manager', department: 'Management', overview: 'We are seeking an experienced Project Manager to lead the delivery of complex infrastructure and construction projects across Southeast Europe.', responsibilities: 'Manage full project lifecycle from planning to delivery\nControl budgets, timelines, and resources\nCoordinate multidisciplinary teams and stakeholders\nEnsure compliance with contracts, standards, and regulations\nReport on progress, risks, and performance', experience: '8–15+ years in construction or infrastructure projects\nProven experience managing projects €10M–€50M+\nExperience with EU/IFI-funded projects is highly preferred', qualifications: 'Degree in Civil Engineering or related field\nPMP, FIDIC, or equivalent certification (preferred)\nStrong knowledge of project management tools and contracts', sort_order: 1 },
      { title: 'Site Engineer', slug: 'site-engineer', department: 'Engineering', overview: 'We are seeking a Site Engineer to support on-site execution and ensure all works are delivered according to design, quality standards, and timelines.', responsibilities: 'Supervise construction works and site activities\nEnsure alignment with technical drawings and specifications\nCoordinate subcontractors and suppliers\nMonitor quality and progress\nSupport issue resolution on-site', experience: '3–8 years in construction or infrastructure projects\nExperience on medium to large construction sites', qualifications: 'Degree in Civil Engineering\nStrong knowledge of construction processes and drawings\nFamiliarity with site documentation and reporting', sort_order: 2 },
      { title: 'Surveyor Engineer', slug: 'surveyor-engineer', department: 'Engineering', overview: 'We are seeking a Surveyor Engineer to ensure precision in measurement, alignment, and positioning across all project phases.', responsibilities: 'Perform topographic and construction surveys\nSet out works and verify alignment\nPrepare survey reports and documentation\nUse GPS, total stations, and modern surveying tools\nMonitor deviations and ensure accuracy', experience: '3–7 years in construction surveying\nExperience in infrastructure projects preferred', qualifications: 'Degree or certification in Surveying or Geodesy\nProficiency with surveying equipment and software', sort_order: 3 },
      { title: 'Cost Engineer', slug: 'cost-engineer', department: 'Finance', overview: 'We are seeking a Cost Engineer to manage budgeting, cost control, and financial performance of projects.', responsibilities: 'Prepare cost estimates and budgets\nMonitor project costs and financial performance\nManage variations, claims, and valuations\nSupport tender pricing\nEnsure cost efficiency', experience: '5–10 years in cost control or quantity surveying\nExperience with infrastructure or civil projects', qualifications: 'Degree in Civil Engineering, Construction Management, or Finance\nStrong Excel and cost management tools skills', sort_order: 4 },
      { title: 'Electrical Engineer', slug: 'electrical-engineer', department: 'Engineering', overview: 'We are seeking an Electrical Engineer to design and oversee electrical systems in infrastructure and energy projects.', responsibilities: 'Design and supervise electrical systems\nEnsure compliance with standards\nOversee installation and commissioning\nCoordinate with project teams\nTroubleshoot and optimize systems', experience: '5–10 years in electrical engineering projects\nExperience in infrastructure or energy sector preferred', qualifications: 'Degree in Electrical Engineering\nKnowledge of EU standards and power systems', sort_order: 5 },
      { title: 'Mechanical Engineer', slug: 'mechanical-engineer', department: 'Engineering', overview: 'We are seeking a Mechanical Engineer to support design and execution of mechanical systems in infrastructure and environmental projects.', responsibilities: 'Design and oversee mechanical systems\nSupervise installation and commissioning\nEnsure compliance with standards\nSupport system optimization\nPrepare technical documentation', experience: '5–10 years in mechanical engineering\nExperience in water, wastewater, or industrial systems preferred', qualifications: 'Degree in Mechanical Engineering\nKnowledge of pumps, pipelines, and treatment systems', sort_order: 6 },
      { title: 'Environmental Expert', slug: 'environmental-expert', department: 'Environmental', overview: 'We are seeking an Environmental Expert to ensure projects meet environmental standards and sustainability requirements.', responsibilities: 'Conduct environmental impact assessments\nEnsure compliance with EU and local regulations\nDevelop environmental management plans\nMonitor environmental performance\nLiaise with authorities and stakeholders', experience: '5–10 years in environmental engineering or consulting\nExperience with EU-funded projects highly preferred', qualifications: 'Degree in Environmental Engineering or related field\nKnowledge of EU environmental directives', sort_order: 7 },
    ];

    const insertCareer = db.prepare(`
      INSERT INTO careers (title, slug, department, overview, responsibilities, experience, qualifications, sort_order)
      VALUES (@title, @slug, @department, @overview, @responsibilities, @experience, @qualifications, @sort_order)
    `);
    for (const item of careerItems) {
      insertCareer.run(item);
    }
    console.log('✓ Careers seeded');
  }

  // Seed partners if none exist
  const partnersExist = db.prepare('SELECT COUNT(*) as count FROM partners').get();
  if (partnersExist.count === 0) {
    const partnerItems = [
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
      { name: 'Environmental Partner', logo: '/images/partners/stacked_disks.png', sort_order: 16 },
    ];

    const insertPartner = db.prepare('INSERT INTO partners (name, logo, sort_order) VALUES (@name, @logo, @sort_order)');
    for (const item of partnerItems) {
      insertPartner.run(item);
    }
    console.log('✓ Partners seeded');
  }

  // Seed hero slides if none exist
  const heroExist = db.prepare('SELECT COUNT(*) as count FROM hero_slides').get();
  if (heroExist.count === 0) {
    const heroItems = [
      { title: 'Construction & Infrastructure', subtitle: 'WESTERN BALKANS & SEE FOCUS', description: 'Delivering large-scale engineering solutions—Buildings, Infrastructure, Water, and Roads—that connect communities and drive economic growth across Southeast Europe.', video_url: 'https://assets.mixkit.co/active_storage/video_items/100223/1721860447/100223-video-1080.mp4', sort_order: 1 },
      { title: 'Construction & Infrastructure', subtitle: 'WESTERN BALKANS & SEE FOCUS', description: 'Delivering large-scale engineering solutions across Southeast Europe.', video_url: '/images/hero_video_2.mp4', sort_order: 2 },
      { title: 'Construction & Infrastructure', subtitle: 'WESTERN BALKANS & SEE FOCUS', description: 'Delivering large-scale engineering solutions across Southeast Europe.', video_url: '/images/hero_video_3.mp4', sort_order: 3 },
    ];

    const insertHero = db.prepare(`
      INSERT INTO hero_slides (title, subtitle, description, video_url, sort_order)
      VALUES (@title, @subtitle, @description, @video_url, @sort_order)
    `);
    for (const item of heroItems) {
      insertHero.run(item);
    }
    console.log('✓ Hero slides seeded');
  }

  console.log('✓ Database initialized successfully');
}

export default db;
