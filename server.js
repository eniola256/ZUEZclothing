import express from 'express';
import dotenv from 'dotenv';
import pg from 'pg';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: '.env.local' });

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.get('/api/health', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as now, current_database() as db');
    res.json({ ok: true, database: result.rows[0].db, time: result.rows[0].now });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get(/^(?!\/api\/).*$/, (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
