import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, 'cms.db');

let db;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDatabase() {
  const database = getDb();
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      display_name TEXT NOT NULL DEFAULT 'Admin',
      role TEXT NOT NULL DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT,
      content TEXT,
      image TEXT,
      gallery TEXT DEFAULT '[]',
      category TEXT DEFAULT 'Announcement',
      location TEXT,
      date TEXT,
      is_published INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      full_content TEXT,
      image TEXT,
      gallery TEXT DEFAULT '[]',
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

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      type TEXT DEFAULT 'text',
      label TEXT,
      category TEXT DEFAULT 'general',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS hero_slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      subtitle TEXT,
      description TEXT,
      video_url TEXT,
      cta_text TEXT,
      cta_link TEXT,
      is_published INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT DEFAULT 'Service',
      icon TEXT,
      image TEXT,
      description TEXT,
      list_items TEXT DEFAULT '[]',
      is_published INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

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

    CREATE TABLE IF NOT EXISTS team (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT,
      image TEXT,
      bio TEXT,
      is_published INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS company_values (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      icon TEXT,
      description TEXT,
      is_published INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  if (database.prepare('SELECT COUNT(*) as count FROM users').get().count === 0) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    database.prepare('INSERT INTO users (username, password, display_name, role) VALUES (?, ?, ?, ?)').run('admin', hashedPassword, '2XAR Admin', 'admin');
  }

  if (database.prepare('SELECT COUNT(*) as count FROM settings').get().count === 0) {
    const defaultSettings = [
      ['site_name', '2XAR', 'text', 'Site Name', 'general'],
      ['stat_projects', '150+', 'text', 'Projects Stat', 'stats'],
      ['stat_experience', '25+', 'text', 'Experience Stat', 'stats'],
      ['stat_countries', '8+', 'text', 'Countries Stat', 'stats'],
      ['stat_partners', '50+', 'text', 'Partners Stat', 'stats'],
    ];
    const insertSetting = database.prepare('INSERT INTO settings (key, value, type, label, category) VALUES (?, ?, ?, ?, ?)');
    for (const s of defaultSettings) insertSetting.run(...s);
  }

  if (database.prepare('SELECT COUNT(*) as count FROM partners').get().count === 0) {
    const partners = [
      { name: 'Guangxi Road Construction', logo: '/images/partners/guangxi_road.jpg', sort_order: 1 },
      { name: 'China Railway', logo: '/images/partners/cr.png', sort_order: 4 },
    ];
    const insertPartner = database.prepare('INSERT INTO partners (name, logo, sort_order) VALUES (@name, @logo, @sort_order)');
    for (const p of partners) insertPartner.run(p);
  }

  if (database.prepare('SELECT COUNT(*) as count FROM projects').get().count === 0) {
    const projectItems = [
      { 
        title: 'North Macedonia Highway', 
        slug: 'north-macedonia-highway', 
        description: 'Major transport hub connecting regions through visionary civil engineering.', 
        full_content: '<p>2XAR is leading the construction of a key expressway section in North Macedonia.</p>',
        image: '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841235472.png', 
        category: 'Infrastructure', 
        location: 'NORTH MACEDONIA', 
        country: 'macedonia', 
        project_type: 'design-build',
        card_size: 'featured', 
        status: 'Completed 2023',
        scale: '42km Expressway',
        client: 'National Roads Authority',
        spec_steel: '12k',
        spec_concrete: '45k',
        spec_incidents: '0',
        sort_order: 1 
      },
      { 
        title: 'Prishtina Business Hub', 
        slug: 'prishtina-business-hub', 
        description: 'Modern commercial complex in the heart of the capital.', 
        full_content: '<p>Prishtina Business Hub is a flagship commercial development designed to provide state-of-the-art office spaces.</p>',
        image: '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841227120.png', 
        category: 'Civil Engineering', 
        location: 'PRISHTINA, KOSOVO', 
        country: 'kosovo', 
        project_type: 'commercial',
        card_size: 'small', 
        status: 'In Progress', 
        scale: '15,000 m²', 
        client: 'Private Investor',
        spec_steel: '', spec_concrete: '', spec_incidents: '',
        sort_order: 2 
      },
      { title: 'Regional Water Plant', slug: 'regional-water-plant', description: 'Advanced water treatment facility.', image: '/Fotot e edituar te 2XAR/freepik_edit-the-provided-photo-b_2841230737.png', category: 'Environment', location: 'KOSOVO', country: 'kosovo', project_type: 'infrastructure', card_size: 'small', status: '', scale: '', client: '', spec_steel: '', spec_concrete: '', spec_incidents: '', sort_order: 3 },
    ];

    const insertProject = database.prepare(`
      INSERT INTO projects (title, slug, description, full_content, image, category, location, country, project_type, card_size, status, scale, client, spec_steel, spec_concrete, spec_incidents, sort_order)
      VALUES (@title, @slug, @description, @full_content, @image, @category, @location, @country, @project_type, @card_size, @status, @scale, @client, @spec_steel, @spec_concrete, @spec_incidents, @sort_order)
    `);

    for (const item of projectItems) {
      const p = {
        full_content: '',
        country: '',
        project_type: '',
        card_size: 'small',
        status: '',
        scale: '',
        client: '',
        spec_steel: '',
        spec_concrete: '',
        spec_incidents: '',
        ...item
      };
      insertProject.run(p);
    }
  }
}

export default getDb();
