import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, 'cms.db');

['', '-wal', '-shm'].forEach(suffix => {
  const p = DB_PATH + suffix;
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log(`✓ Deleted ${p}`);
  }
});

const { initDatabase } = await import('./database.js');
initDatabase();
console.log('✓ Database re-initialized.');
