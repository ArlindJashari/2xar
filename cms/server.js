import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initDatabase } from './database.js';
import routes from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.CMS_PORT || 3001;

// Init database
initDatabase();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: '2xar-cms-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Serve uploaded files
app.use('/cms/uploads', express.static(join(__dirname, 'uploads')));

// API routes
app.use('/api', routes);

// Serve admin panel
app.use('/admin', express.static(join(__dirname, 'admin')));
app.get('/admin/{*path}', (req, res) => {
  res.sendFile(join(__dirname, 'admin', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🔧 2XAR CMS Server running at http://localhost:${PORT}`);
  console.log(`📋 Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`\n   Default login: admin / admin123\n`);
});
