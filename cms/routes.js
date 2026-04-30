import { Router } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import db from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// ── File Upload Config ──────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg|mp4|webm/;
    const extMatch = allowedTypes.test(extname(file.originalname).toLowerCase());
    const mimeMatch = allowedTypes.test(file.mimetype);
    if (extMatch || mimeMatch) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos allowed'));
    }
  }
});

// ── Auth Middleware ──────────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

// ── Auth Routes ─────────────────────────────────────────────
router.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  req.session.userId = user.id;
  req.session.username = user.username;
  res.json({ success: true, user: { id: user.id, username: user.username, display_name: user.display_name } });
});

router.post('/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

router.get('/auth/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, username, display_name, role FROM users WHERE id = ?').get(req.session.userId);
  res.json({ user });
});

router.put('/auth/password', requireAuth, (req, res) => {
  const { current_password, new_password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  if (!bcrypt.compareSync(current_password, user.password)) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }
  const hashed = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(hashed, user.id);
  res.json({ success: true });
});

// ── File Upload ─────────────────────────────────────────────
router.post('/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/cms/uploads/${req.file.filename}`, filename: req.file.filename });
});

// ── Generic CRUD helpers ────────────────────────────────────
function createCRUD(tableName, { searchFields = ['title'], defaultOrder = 'sort_order ASC, id DESC' } = {}) {
  // GET all
  router.get(`/${tableName}`, requireAuth, (req, res) => {
    const { search, is_published, limit, offset } = req.query;
    let query = `SELECT * FROM ${tableName}`;
    const params = [];
    const conditions = [];

    if (search && searchFields.length > 0) {
      const searchConds = searchFields.map(f => `${f} LIKE ?`);
      conditions.push(`(${searchConds.join(' OR ')})`);
      searchFields.forEach(() => params.push(`%${search}%`));
    }

    if (is_published !== undefined) {
      conditions.push('is_published = ?');
      params.push(is_published);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY ${defaultOrder}`;

    if (limit) {
      query += ` LIMIT ?`;
      params.push(parseInt(limit));
      if (offset) {
        query += ` OFFSET ?`;
        params.push(parseInt(offset));
      }
    }

    const items = db.prepare(query).all(...params);
    const total = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get().count;
    res.json({ items, total });
  });

  // CREATE
  router.post(`/${tableName}`, requireAuth, (req, res) => {
    const data = req.body;
    const keys = Object.keys(data);
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map(k => data[k]);

    try {
      const result = db.prepare(`INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`).run(...values);
      const item = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(result.lastInsertRowid);
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Bulk update sort order — MUST be before /:id
  router.put(`/${tableName}/reorder`, requireAuth, (req, res) => {
    const { items } = req.body;
    const updateStmt = db.prepare(`UPDATE ${tableName} SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    const transaction = db.transaction(() => {
      for (const item of items) {
        updateStmt.run(item.sort_order, item.id);
      }
    });
    transaction();
    res.json({ success: true });
  });

  // Toggle publish — MUST be before /:id
  router.patch(`/${tableName}/:id/toggle-publish`, requireAuth, (req, res) => {
    const item = db.prepare(`SELECT is_published FROM ${tableName} WHERE id = ?`).get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    const newVal = item.is_published ? 0 : 1;
    db.prepare(`UPDATE ${tableName} SET is_published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(newVal, req.params.id);
    res.json({ success: true, is_published: newVal });
  });

  // GET one
  router.get(`/${tableName}/:id`, requireAuth, (req, res) => {
    const item = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  });

  // UPDATE
  router.put(`/${tableName}/:id`, requireAuth, (req, res) => {
    const data = req.body;
    const keys = Object.keys(data);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = [...keys.map(k => data[k]), req.params.id];

    try {
      db.prepare(`UPDATE ${tableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
      const item = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(req.params.id);
      res.json(item);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // DELETE
  router.delete(`/${tableName}/:id`, requireAuth, (req, res) => {
    db.prepare(`DELETE FROM ${tableName} WHERE id = ?`).run(req.params.id);
    res.json({ success: true });
  });
}

// Register CRUD for each entity
createCRUD('news', { searchFields: ['title', 'excerpt', 'category'] });
createCRUD('projects', { searchFields: ['title', 'description', 'category'] });
createCRUD('careers', { searchFields: ['title', 'department', 'location'] });
createCRUD('partners', { searchFields: ['name'] });
createCRUD('hero_slides', { searchFields: ['title', 'subtitle'] });

// ── Settings Routes ─────────────────────────────────────────
router.get('/settings', requireAuth, (req, res) => {
  const { category } = req.query;
  let query = 'SELECT * FROM settings';
  const params = [];
  if (category) {
    query += ' WHERE category = ?';
    params.push(category);
  }
  query += ' ORDER BY category, key';
  const items = db.prepare(query).all(...params);
  res.json({ items });
});

router.put('/settings', requireAuth, (req, res) => {
  const { settings } = req.body; // [{ key, value }]
  const updateStmt = db.prepare('UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?');
  const transaction = db.transaction(() => {
    for (const s of settings) {
      updateStmt.run(s.value, s.key);
    }
  });
  transaction();
  res.json({ success: true });
});

// ── Public API (for frontend consumption) ───────────────────
router.get('/public/news', (req, res) => {
  const { limit, slug } = req.query;
  if (slug) {
    const item = db.prepare('SELECT * FROM news WHERE slug = ? AND is_published = 1').get(slug);
    return res.json(item || null);
  }
  let query = 'SELECT * FROM news WHERE is_published = 1 ORDER BY sort_order ASC, date DESC';
  const params = [];
  if (limit) {
    query += ' LIMIT ?';
    params.push(parseInt(limit));
  }
  res.json(db.prepare(query).all(...params));
});

router.get('/public/projects', (req, res) => {
  const { limit, slug, category, country } = req.query;
  let query = 'SELECT * FROM projects WHERE is_published = 1';
  const params = [];
  if (slug) {
    const item = db.prepare('SELECT * FROM projects WHERE slug = ? AND is_published = 1').get(slug);
    return res.json(item || null);
  }
  if (category) { query += ' AND category = ?'; params.push(category); }
  if (country) { query += ' AND country = ?'; params.push(country); }
  query += ' ORDER BY sort_order ASC';
  if (limit) { query += ' LIMIT ?'; params.push(parseInt(limit)); }
  res.json(db.prepare(query).all(...params));
});

router.get('/public/careers', (req, res) => {
  res.json(db.prepare('SELECT * FROM careers WHERE is_published = 1 ORDER BY sort_order ASC').all());
});

router.get('/public/partners', (req, res) => {
  res.json(db.prepare('SELECT * FROM partners WHERE is_published = 1 ORDER BY sort_order ASC').all());
});

router.get('/public/hero', (req, res) => {
  res.json(db.prepare('SELECT * FROM hero_slides WHERE is_published = 1 ORDER BY sort_order ASC').all());
});

router.get('/public/settings', (req, res) => {
  const items = db.prepare('SELECT key, value FROM settings').all();
  const obj = {};
  items.forEach(s => { obj[s.key] = s.value; });
  res.json(obj);
});

// ── Dashboard Stats ─────────────────────────────────────────
router.get('/dashboard/stats', requireAuth, (req, res) => {
  const stats = {
    news: db.prepare('SELECT COUNT(*) as total, SUM(is_published) as published FROM news').get(),
    projects: db.prepare('SELECT COUNT(*) as total, SUM(is_published) as published FROM projects').get(),
    careers: db.prepare('SELECT COUNT(*) as total, SUM(is_published) as published FROM careers').get(),
    partners: db.prepare('SELECT COUNT(*) as total, SUM(is_published) as published FROM partners').get(),
    hero_slides: db.prepare('SELECT COUNT(*) as total, SUM(is_published) as published FROM hero_slides').get(),
  };
  res.json(stats);
});

export { requireAuth };
export default router;
