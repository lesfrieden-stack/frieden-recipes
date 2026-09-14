const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const { rows } = await sql`SELECT name FROM chefs ORDER BY name ASC`;
    return res.status(200).json(rows.map((r) => r.name));
  }

  if (req.method === 'POST') {
    const name = ((req.body || {}).name || '').trim();
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    await sql`INSERT INTO chefs (name) VALUES (${name}) ON CONFLICT (name) DO NOTHING`;
    return res.status(201).json({ success: true });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
};
