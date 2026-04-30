import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, 'cms.db');
const db = new Database(DB_PATH);

console.log('Resetting and Reseeding Partners...');

// Delete existing partners
db.prepare('DELETE FROM partners').run();

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

const insertPartner = db.prepare('INSERT INTO partners (name, logo, sort_order) VALUES (@name, @logo, @sort_order)');
for (const p of partners) insertPartner.run(p);

console.log('✓ Partners reseeded.');
