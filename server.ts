import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database('inventory.db');
const JWT_SECRET = process.env.JWT_SECRET || 'mao-seed-secret-key';

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'staff'
  );

  CREATE TABLE IF NOT EXISTS seeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    variety TEXT,
    quantity REAL,
    unit TEXT,
    category TEXT,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS distributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seed_id INTEGER,
    recipient TEXT,
    address TEXT,
    contact_number TEXT,
    quantity REAL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(seed_id) REFERENCES seeds(id)
  );

  -- Migration for existing tables
  PRAGMA table_info(distributions);
`);

// Ensure new columns exist for existing databases
try { db.exec("ALTER TABLE distributions ADD COLUMN address TEXT;"); } catch(e) {}
try { db.exec("ALTER TABLE distributions ADD COLUMN contact_number TEXT;"); } catch(e) {}

// Seed initial admin if not exists
const adminExists = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('admin', hashedPassword, 'admin');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // Auth Routes
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ id: user.id, username: user.username, role: user.role });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  app.get('/api/auth/me', authenticate, (req: any, res) => {
    res.json(req.user);
  });

  // Inventory Routes
  app.get('/api/seeds', authenticate, (req, res) => {
    const seeds = db.prepare('SELECT * FROM seeds ORDER BY name ASC').all();
    res.json(seeds);
  });

  app.post('/api/seeds', authenticate, (req, res) => {
    const { name, variety, quantity, unit, category } = req.body;
    const result = db.prepare('INSERT INTO seeds (name, variety, quantity, unit, category) VALUES (?, ?, ?, ?, ?)').run(name, variety, quantity, unit, category);
    res.json({ id: result.lastInsertRowid });
  });

  app.put('/api/seeds/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const { name, variety, quantity, unit, category } = req.body;
    db.prepare('UPDATE seeds SET name = ?, variety = ?, quantity = ?, unit = ?, category = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?').run(name, variety, quantity, unit, category, id);
    res.json({ success: true });
  });

  app.delete('/api/seeds/:id', authenticate, (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM seeds WHERE id = ?').run(id);
    res.json({ success: true });
  });

  // Distribution Routes
  app.get('/api/distributions', authenticate, (req, res) => {
    const dists = db.prepare(`
      SELECT d.*, s.name as seed_name 
      FROM distributions d 
      JOIN seeds s ON d.seed_id = s.id 
      ORDER BY d.date DESC
    `).all();
    res.json(dists);
  });

  app.post('/api/distributions', authenticate, (req, res) => {
    const { seed_id, recipient, address, contact_number, quantity } = req.body;
    
    // Start transaction
    const transaction = db.transaction(() => {
      const seed: any = db.prepare('SELECT quantity FROM seeds WHERE id = ?').get(seed_id);
      if (!seed || seed.quantity < quantity) {
        throw new Error('Insufficient stock');
      }
      
      db.prepare('UPDATE seeds SET quantity = quantity - ? WHERE id = ?').run(quantity, seed_id);
      db.prepare('INSERT INTO distributions (seed_id, recipient, address, contact_number, quantity) VALUES (?, ?, ?, ?, ?)').run(seed_id, recipient, address, contact_number, quantity);
    });

    try {
      transaction();
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
