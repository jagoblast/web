import { Hono } from 'hono';

const app = new Hono();

app.post('/', async (c) => {
  try {
    const payload = await c.req.json();
    
    // Pastikan tabel store_settings ada, dan update/insert row dengan ID 'GLOBAL'
    // Gunakan fungsi INSERT OR REPLACE bawaan SQLite
    await c.env.DB.prepare(`
      INSERT INTO store_settings (id, config_json) 
      VALUES ('GLOBAL', ?) 
      ON CONFLICT(id) DO UPDATE SET config_json = excluded.config_json
    `).bind(JSON.stringify(payload)).run();

    return c.json({ success: true });
  } catch (err: any) {
    console.error('Settings Update Error:', err.message);
    return c.json({ success: false, error: err.message }, 500);
  }
});

export default app;