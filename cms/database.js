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
      gallery TEXT DEFAULT '[]', -- JSON array of image URLs
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
      gallery TEXT DEFAULT '[]', -- JSON array of image URLs
      category TEXT DEFAULT 'Infrastructure',
      location TEXT,
      country TEXT,
      project_type TEXT,
      value TEXT,
      card_size TEXT DEFAULT 'small',
      status TEXT,
      scale TEXT,
      client TEXT,
      spec_steel TEXT,
      spec_concrete TEXT,
      spec_incidents TEXT,
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

    -- Services & Sectors
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      image TEXT,
      category TEXT DEFAULT 'Service', -- 'Service' or 'Sector'
      list_items TEXT DEFAULT '[]', -- JSON array of strings
      is_published INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Timeline / History
    CREATE TABLE IF NOT EXISTS timeline (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      image TEXT,
      is_published INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Leadership Team
    CREATE TABLE IF NOT EXISTS team (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT,
      bio TEXT,
      image TEXT,
      is_published INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Company Values
    CREATE TABLE IF NOT EXISTS company_values (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      is_published INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default admin
  const adminExists = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (adminExists.count === 0) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (username, password, display_name, role) VALUES (?, ?, ?, ?)').run('admin', hashedPassword, '2XAR Admin', 'admin');
    console.log('✓ Default admin created');
  }

  // Seed settings
  const settingsExist = db.prepare('SELECT COUNT(*) as count FROM settings').get();
  if (settingsExist.count === 0) {
    const defaultSettings = [
      ['site_name', '2XAR', 'text', 'Site Name', 'general'],
      ['site_tagline', 'Construction & Infrastructure', 'text', 'Tagline', 'general'],
      ['contact_email', 'info@2xar.global', 'text', 'Contact Email', 'contact'],
      ['hr_email', 'careers@2xar.global', 'text', 'HR Email', 'contact'],
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
    for (const s of defaultSettings) insertSetting.run(...s);
  }

  // Seed team
  if (db.prepare('SELECT COUNT(*) as count FROM team').get().count === 0) {
    const team = [
      { name: 'Ardian Hoxha', role: 'Co-Owner & Strategic Director', bio: 'Ardian brings over 25 years of strategic vision to 2XAR. His leadership has been instrumental in transforming the company from a local firm into a regional leader in infrastructure and large-scale engineering.', image: '/images/ardian_hoxha.jpg', sort_order: 1 },
      { name: 'Arlind Metaliaj', role: 'Co-Founder & Executive Director', bio: 'As a co-founder of 2XAR, Arlind has been pivotal in seeking out new opportunities and establishing the company\'s reputation for engineering precision.', image: '/images/intro_engineers_1770233626128.png', sort_order: 2 }
    ];
    const insertTeam = db.prepare('INSERT INTO team (name, role, bio, image, sort_order) VALUES (@name, @role, @bio, @image, @sort_order)');
    for (const t of team) insertTeam.run(t);
  }

  // Seed timeline
  if (db.prepare('SELECT COUNT(*) as count FROM timeline').get().count === 0) {
    const timeline = [
      { year: '1999', title: 'Laying the First Stone', description: 'In the aftermath of conflict, 2XAR was founded in Prishtina with a singular mission: to rebuild. We started with essential residential reconstruction.', image: '/images/materials_texture_1770233652195.png', sort_order: 1 },
      { year: '2005', title: 'Major Transit & Bridges', description: 'Our first breakthrough in civil infrastructure. We successfully delivered the R-7 Connector Bridge.', image: '/images/hero_bridge_1770233612287.png', sort_order: 2 },
      { year: '2015', title: 'Regional Expansion', description: 'Opening offices in Albania and Macedonia, 2XAR transitioned from a local builder to a regional powerhouse.', image: '/images/intro_engineers_1770233626128.png', sort_order: 3 },
      { year: '2024', title: 'The Industry Standard', description: 'Today, with over €350M in completed projects, we stand as the benchmark for quality.', image: '/images/featured_steel_1770233640417.png', sort_order: 4 }
    ];
    const insertTime = db.prepare('INSERT INTO timeline (year, title, description, image, sort_order) VALUES (@year, @title, @description, @image, @sort_order)');
    for (const t of timeline) insertTime.run(t);
  }

  // Seed values
  if (db.prepare('SELECT COUNT(*) as count FROM company_values').get().count === 0) {
    const values = [
      { title: 'Maximum Commitment', description: 'We work with the objective of reducing the environmental impact of our activities.', icon: 'check-circle', sort_order: 1 },
      { title: 'Respect for the Environment', description: '2xAR L.L.C. shows empathy by continually contributing to local community development.', icon: 'leaf', sort_order: 2 },
      { title: 'Excellence', description: 'We don\'t settle for "good enough." Every beam, every pour, and every plan is executed to the highest international standards.', icon: 'star', sort_order: 3 },
      { title: 'Integrity', description: 'Transparency and honesty are the bedrock of our client relationships.', icon: 'handshake', sort_order: 4 },
      { title: 'Innovation', description: 'Adopting the latest construction technologies and sustainability practices.', icon: 'lightbulb', sort_order: 5 },
    ];
    const insertVal = db.prepare('INSERT INTO company_values (title, description, icon, sort_order) VALUES (@title, @description, @icon, @sort_order)');
    for (const v of values) insertVal.run(v);
  }

  // Seed services & sectors
  if (db.prepare('SELECT COUNT(*) as count FROM services').get().count === 0) {
    const services = [
      { title: 'Building Construction', icon: 'buildings', category: 'Service', list_items: JSON.stringify(['Residential (multi-story housing)', 'Commercial (offices, retail, mixed-use)', 'Institutional (schools, hospitals, public buildings)']), image: '/images/project_residential.png', sort_order: 1 },
      { title: 'Transport & Civil Infrastructure', icon: 'road-horizon', category: 'Service', list_items: JSON.stringify(['Roads & Highways', 'Bridges & Tunnels', 'Urban infrastructure']), image: '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841231795.png', sort_order: 2 },
      { title: 'Water & Environmental', icon: 'drop', category: 'Service', list_items: JSON.stringify(['Water treatment plants', 'Wastewater treatment', 'Pumping stations, pipelines']), image: '/images/project_water.png', sort_order: 3 },
      { title: 'Energy & Industrial', icon: 'lightning', category: 'Service', list_items: JSON.stringify(['Small power facilities / substations', 'Industrial buildings / plants']), image: '/images/project_steel.png', sort_order: 4 },
      { title: 'Engineering & Project Management', icon: 'strategy', category: 'Service', list_items: JSON.stringify(['Design & engineering coordination', 'EPC / Design–Build', 'Construction management']), image: '/images/intro_engineers_1770233626128.png', sort_order: 5 },
      { title: 'Maintenance & Rehabilitation', icon: 'wrench', category: 'Service', list_items: JSON.stringify(['Road rehabilitation', 'Facility upgrades', 'Long-term maintenance contracts']), image: '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841230737.png', sort_order: 6 },
      
      { title: 'Public Sector & Government', icon: 'bank', category: 'Sector', list_items: JSON.stringify(['Ministries', 'Municipalities', 'State Agencies']), image: '/images/project_viaduct.png', sort_order: 7 },
      { title: 'Private Developers & Investors', icon: 'buildings', category: 'Sector', list_items: JSON.stringify(['Real Estate Developers', 'Industrial Investors', 'Private Landowners']), image: '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841240652.png', sort_order: 8 },
      { title: 'International Financial Institutions', icon: 'globe', category: 'Sector', list_items: JSON.stringify(['EBRD, EIB, World Bank', 'EU funds, KfW, Saudi Fund']), image: '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841227120.png', sort_order: 9 },
      { title: 'Commercial & Retail', icon: 'shopping-bag-open', category: 'Sector', list_items: JSON.stringify(['Shopping Centers', 'Mixed-Use Developments', 'Logistics Hubs']), image: '/images/project_steel.png', sort_order: 10 },
      { title: 'Social & Community Infrastructure', icon: 'users-three', category: 'Sector', list_items: JSON.stringify(['Schools & Hospitals', 'Sports Facilities', 'Cultural Buildings']), image: '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841226132.png', sort_order: 11 },
    ];
    const insertSrv = db.prepare('INSERT INTO services (title, icon, category, list_items, image, sort_order) VALUES (@title, @icon, @category, @list_items, @image, @sort_order)');
    for (const s of services) insertSrv.run(s);
  }

  // Seed projects
  if (db.prepare('SELECT COUNT(*) as count FROM projects').get().count === 0) {
    const projectItems = [
      {
        title: 'North Macedonia welcomes new highway',
        slug: 'north-macedonia-highway',
        description: 'Major transport hub connecting regions through visionary civil engineering.',
        full_content: '<p>Engineering massive connections across complex terrains with unparalleled precision.</p><p>Overcoming complex geographical challenges, our team implemented advanced cantilever construction methods to bridge the valley without disrupting the sensitive local ecosystem. This project marks a significant milestone in our commitment to connecting Southeast Europe through visionary engineering.</p>',
        image: '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841226132.png',
        gallery: JSON.stringify([
          '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841227120.png',
          '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841230737.png',
          '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841231795.png',
          '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841240652.png',
          '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841217730.png',
          '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841218675.png'
        ]),
        category: 'Infrastructure',
        location: 'ALBANIA / MKD',
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
      { title: 'Prishtina Business Hub', slug: 'prishtina-business-hub', description: 'Modern commercial complex in the heart of the capital.', image: '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841227120.png', gallery: '[]', category: 'Civil Engineering', location: 'PRISHTINA, KOSOVO', country: 'kosovo', card_size: 'small', sort_order: 2, full_content: '', project_type: '', status: '', scale: '', client: '', spec_steel: '', spec_concrete: '', spec_incidents: '' },
      { title: 'Regional Water Plant', slug: 'regional-water-plant', description: 'Advanced water treatment facility serving multiple municipalities.', image: '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841230737.png', gallery: '[]', category: 'Environment', location: 'KOSOVO', country: 'kosovo', card_size: 'small', sort_order: 3, full_content: '', project_type: '', status: '', scale: '', client: '', spec_steel: '', spec_concrete: '', spec_incidents: '' },
      { title: 'City Boulevard Expansion', slug: 'city-boulevard-expansion', description: 'Modernizing city centers with sustainable infrastructure and smart design.', image: '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841231795.png', gallery: '[]', category: 'Urban Planning', location: 'PRISHTINA, KOSOVO', country: 'kosovo', card_size: 'landscape', sort_order: 4, full_content: '', project_type: '', status: '', scale: '', client: '', spec_steel: '', spec_concrete: '', spec_incidents: '' },
      { title: 'Pumping Stations', slug: 'pumping-stations', description: 'Advanced water management systems for regional agricultural and urban needs.', image: '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841240652.png', gallery: '[]', category: 'Water & Environment', location: 'KOSOVO', country: 'kosovo', card_size: 'featured', sort_order: 5, full_content: '', project_type: '', status: '', scale: '', client: '', spec_steel: '', spec_concrete: '', spec_incidents: '' },
      { title: 'Project Site Technical Review', slug: 'site-technical-review', description: 'Comprehensive site inspection and quality assurance processes.', image: '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841217730.png', gallery: '[]', category: 'Site Inspection', location: 'WESTERN BALKANS', country: '', card_size: 'small', sort_order: 6, full_content: '', project_type: '', status: '', scale: '', client: '', spec_steel: '', spec_concrete: '', spec_incidents: '' },
      { title: 'Regional Leadership Visit', slug: 'regional-leadership-visit', description: 'High-profile visits to our major project sites.', image: '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841218675.png', gallery: '[]', category: 'Public Relations', location: 'WESTERN BALKANS', country: '', card_size: 'small', sort_order: 7, full_content: '', project_type: '', status: '', scale: '', client: '', spec_steel: '', spec_concrete: '', spec_incidents: '' },
    ];

    const insertProject = db.prepare(`
      INSERT INTO projects (title, slug, description, full_content, image, gallery, category, location, country, project_type, card_size, status, scale, client, spec_steel, spec_concrete, spec_incidents, sort_order)
      VALUES (@title, @slug, @description, @full_content, @image, @gallery, @category, @location, @country, @project_type, @card_size, @status, @scale, @client, @spec_steel, @spec_concrete, @spec_incidents, @sort_order)
    `);

    for (const item of projectItems) insertProject.run(item);
  }

  // Seed news
  if (db.prepare('SELECT COUNT(*) as count FROM news').get().count === 0) {
    const newsItems = [
      { title: '2xAR Awarded Major Environmental Infrastructure Contract in Kosovo', slug: '2xar-environmental-infrastructure-kosovo', excerpt: '2xAR has been awarded a landmark €40 million contract for the development of a national landfill and waste management system in Kosovo.', content: '<p><strong>PRISHTINA, KOSOVO</strong> — 2xAR has been awarded a landmark €40 million contract for the development of a national landfill and waste management system in Kosovo. This environmental infrastructure project represents a significant step forward in the country\'s waste management capabilities and environmental protection efforts.</p><p>The project encompasses the design and construction of state-of-the-art landfill facilities, including advanced leachate treatment systems, methane capture infrastructure, and comprehensive waste sorting and recycling capabilities.</p>', image: '/Fotot per News&Insights/1 Landfill.webp', gallery: '[]', category: 'Environmental', location: 'PRISHTINA, KOSOVO', date: '2026-03-15', sort_order: 1 },
      { title: '2xAR Secures €53.4M Contract for Strategic Transport Corridor', slug: '2xar-berane-rozhaje-corridor', excerpt: '2xAR has been awarded a €53.4 million contract for the development of a key section of the Berane–Rozhaje corridor in Montenegro.', content: '<p><strong>BERANE, MONTENEGRO</strong> — 2xAR has been awarded a €53.4 million contract for the development of a key section of the Berane–Rozhaje corridor, a project of strategic importance for regional connectivity.</p>', image: '/Fotot per News&Insights/2. Berane – Rozhaje Corridor.png', gallery: '[]', category: 'Infrastructure', location: 'BERANE, MONTENEGRO', date: '2026-02-28', sort_order: 2 },
      { title: '2xAR Advances €32.5M Infrastructure Development in Shtip', slug: '2xar-shtip-infrastructure', excerpt: '2xAR is leading the development of a €32.5 million infrastructure project in Shtip, focused on upgrading urban systems and utility networks.', content: '<p><strong>SHTIP, NORTH MACEDONIA</strong> — 2xAR is leading the development of a €32.5 million infrastructure project in Shtip, focused on upgrading urban systems and utility networks.</p>', image: '/Fotot per News&Insights/3, Shtip Infrastructure Project.jpg', gallery: '[]', category: 'Infrastructure', location: 'SHTIP, NORTH MACEDONIA', date: '2026-02-10', sort_order: 3 },
      { title: '2xAR Delivers €23M Infrastructure Upgrade in Tetovo', slug: '2xar-tetovo-infrastructure', excerpt: '2xAR is executing a €23 million infrastructure development project in Tetovo, focused on strengthening urban connectivity.', content: '<p><strong>TETOVO, NORTH MACEDONIA</strong> — 2xAR is executing a €23 million infrastructure development project in Tetovo, focused on strengthening urban connectivity and public infrastructure.</p>', image: '/Fotot per News&Insights/4. Tetovo Infrastructure Project.jpg', gallery: '[]', category: 'Infrastructure', location: 'TETOVO, NORTH MACEDONIA', date: '2026-01-20', sort_order: 4 },
      { title: '2xAR Awarded €13M Infrastructure Contract in Mojkovac', slug: '2xar-mojkovac-infrastructure', excerpt: '2xAR has secured a €13 million contract for infrastructure development in Mojkovac.', content: '<p><strong>MOJKOVAC, MONTENEGRO</strong> — 2xAR has secured a €13 million contract for infrastructure development in Mojkovac, contributing to regional connectivity and economic growth.</p>', image: '/Fotot per News&Insights/6, MOJKOVAC, MONTENEGRO.jpg', gallery: '[]', category: 'Infrastructure', location: 'MOJKOVAC, MONTENEGRO', date: '2025-12-15', sort_order: 5 },
      { title: '2xAR Expands Water Infrastructure in Vitia with €6.5M Project', slug: '2xar-vitia-water-infrastructure', excerpt: '2xAR is delivering a €6.5 million water infrastructure project in Viti.', content: '<p><strong>VITI, KOSOVO</strong> — 2xAR is delivering a €6.5 million water infrastructure project in Viti, aimed at improving water supply systems and supporting sustainable development.</p>', image: '/Fotot per News&Insights/6. Vitia.jpg', gallery: '[]', category: 'Water & Environment', location: 'VITI, KOSOVO', date: '2025-11-01', sort_order: 6 },
      { title: '2xAR Implements Environmental Infrastructure Project in Mavrovo', slug: '2xar-mavrovo-environmental', excerpt: '2xAR is delivering a €2.4 million environmental infrastructure project in Mavrovo.', content: '<p><strong>MAVROVO, NORTH MACEDONIA</strong> — 2xAR is delivering a €2.4 million environmental infrastructure project in Mavrovo, focused on sustainability and ecological protection.</p>', image: '/Fotot per News&Insights/7. Mavrovo.jpg', gallery: '[]', category: 'Environmental', location: 'MAVROVO, NORTH MACEDONIA', date: '2025-10-01', sort_order: 7 },
    ];
    const insertNews = db.prepare('INSERT INTO news (title, slug, excerpt, content, image, gallery, category, location, date, sort_order) VALUES (@title, @slug, @excerpt, @content, @image, @gallery, @category, @location, @date, @sort_order)');
    for (const item of newsItems) insertNews.run(item);
  }

  // Seed careers
  if (db.prepare('SELECT COUNT(*) as count FROM careers').get().count === 0) {
    const careerItems = [
      { title: 'Project Manager', slug: 'project-manager', department: 'Management', overview: 'We are seeking an experienced Project Manager to lead the delivery of complex infrastructure and construction projects across Southeast Europe.', responsibilities: 'Manage full project lifecycle from planning to delivery\nControl budgets, timelines, and resources\nCoordinate multidisciplinary teams and stakeholders\nEnsure compliance with contracts, standards, and regulations\nReport on progress, risks, and performance', experience: '8–15+ years in construction or infrastructure projects\nProven experience managing projects €10M–€50M+\nExperience with EU/IFI-funded projects is highly preferred', qualifications: 'Degree in Civil Engineering or related field\nPMP, FIDIC, or equivalent certification (preferred)\nStrong knowledge of project management tools and contracts', sort_order: 1 },
      { title: 'Site Engineer', slug: 'site-engineer', department: 'Engineering', overview: 'We are seeking a Site Engineer to support on-site execution and ensure all works are delivered according to design, quality standards, and timelines.', responsibilities: 'Supervise construction works and site activities\nEnsure alignment with technical drawings and specifications\nCoordinate subcontractors and suppliers\nMonitor quality and progress\nSupport issue resolution on-site', experience: '3–8 years in construction or infrastructure projects\nExperience on medium to large construction sites', qualifications: 'Degree in Civil Engineering\nStrong knowledge of construction processes and drawings\nFamiliarity with site documentation and reporting', sort_order: 2 },
      { title: 'Surveyor Engineer', slug: 'surveyor-engineer', department: 'Engineering', overview: 'We are seeking a Surveyor Engineer to ensure precision in measurement, alignment, and positioning across all project phases.', responsibilities: 'Perform topographic and construction surveys\nSet out works and verify alignment\nPrepare survey reports and documentation\nUse GPS, total stations, and modern surveying tools\nMonitor deviations and ensure accuracy', experience: '3–7 years in construction surveying\nExperience in infrastructure projects preferred', qualifications: 'Degree or certification in Surveying or Geodesy\nProficiency with surveying equipment and software', sort_order: 3 },
      { title: 'Cost Engineer', slug: 'cost-engineer', department: 'Finance', overview: 'We are seeking a Cost Engineer to manage budgeting, cost control, and financial performance of projects.', responsibilities: 'Prepare cost estimates and budgets\nMonitor project costs and financial performance\nManage variations, claims, and valuations\nSupport tender pricing\nEnsure cost efficiency', experience: '5–10 years in cost control or quantity surveying\nExperience with infrastructure or civil projects', qualifications: 'Degree in Civil Engineering, Construction Management, or Finance\nStrong Excel and cost management tools skills', sort_order: 4 },
      { title: 'Electrical Engineer', slug: 'electrical-engineer', department: 'Engineering', overview: 'We are seeking an Electrical Engineer to design and oversee electrical systems in infrastructure and energy projects.', responsibilities: 'Design and supervise electrical systems\nEnsure compliance with standards\nOversee installation and commissioning\nCoordinate with project teams\nTroubleshoot and optimize systems', experience: '5–10 years in electrical engineering projects\nExperience in infrastructure or energy sector preferred', qualifications: 'Degree in Electrical Engineering\nKnowledge of EU standards and power systems', sort_order: 5 },
      { title: 'Mechanical Engineer', slug: 'mechanical-engineer', department: 'Engineering', overview: 'We are seeking a Mechanical Engineer to support design and execution of mechanical systems in infrastructure and environmental projects.', responsibilities: 'Design and oversee mechanical systems\nSupervise installation and commissioning\nEnsure compliance with standards\nSupport system optimization\nPrepare technical documentation', experience: '5–10 years in mechanical engineering\nExperience in water, wastewater, or industrial systems preferred', qualifications: 'Degree in Mechanical Engineering\nKnowledge of pumps, pipelines, and treatment systems', sort_order: 6 },
      { title: 'Environmental Expert', slug: 'environmental-expert', department: 'Environmental', overview: 'We are seeking an Environmental Expert to ensure projects meet environmental standards and sustainability requirements.', responsibilities: 'Conduct environmental impact assessments\nEnsure compliance with EU and local regulations\nDevelop environmental management plans\nMonitor environmental performance\nLiaise with authorities and stakeholders', experience: '5–10 years in environmental engineering or consulting\nExperience with EU-funded projects highly preferred', qualifications: 'Degree in Environmental Engineering or related field\nKnowledge of EU environmental directives', sort_order: 7 },
    ];
    const insertCareer = db.prepare('INSERT INTO careers (title, slug, department, overview, responsibilities, experience, qualifications, sort_order) VALUES (@title, @slug, @department, @overview, @responsibilities, @experience, @qualifications, @sort_order)');
    for (const item of careerItems) insertCareer.run(item);
  }

  // Seed partners
  if (db.prepare('SELECT COUNT(*) as count FROM partners').get().count === 0) {
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
    for (const item of partnerItems) insertPartner.run(item);
  }

  // Seed hero slides
  if (db.prepare('SELECT COUNT(*) as count FROM hero_slides').get().count === 0) {
    const heroItems = [
      { title: 'Construction & Infrastructure', subtitle: 'WESTERN BALKANS & SEE FOCUS', description: 'Delivering large-scale engineering solutions—Buildings, Infrastructure, Water, and Roads—that connect communities and drive economic growth across Southeast Europe.', video_url: 'https://assets.mixkit.co/active_storage/video_items/100223/1721860447/100223-video-1080.mp4', sort_order: 1 },
      { title: 'Construction & Infrastructure', subtitle: 'WESTERN BALKANS & SEE FOCUS', description: 'Delivering large-scale engineering solutions across Southeast Europe.', video_url: '/images/hero_video_2.mp4', sort_order: 2 },
      { title: 'Construction & Infrastructure', subtitle: 'WESTERN BALKANS & SEE FOCUS', description: 'Delivering large-scale engineering solutions across Southeast Europe.', video_url: '/images/hero_video_3.mp4', sort_order: 3 },
    ];
    const insertHero = db.prepare('INSERT INTO hero_slides (title, subtitle, description, video_url, sort_order) VALUES (@title, @subtitle, @description, @video_url, @sort_order)');
    for (const item of heroItems) insertHero.run(item);
  }

  console.log('✓ Database initialized successfully');
}

export default db;
