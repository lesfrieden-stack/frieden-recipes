const { sql } = require('@vercel/postgres');
const { eventRowToJson } = require('../../lib/db');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const { rows } = await sql`SELECT * FROM events ORDER BY event_date ASC, id ASC`;
    return res.status(200).json(rows.map(eventRowToJson));
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const title = (body.title || '').trim();
    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    const chef = body.chef || 'Deborah Frieden';
    const type = body.type || '';
    const date = body.date || '';
    const wines = body.wines || '';
    const guests = JSON.stringify(body.guests || []);
    const notes = body.notes || '';
    const items = JSON.stringify(body.items || []);

    const { rows } = await sql`
      INSERT INTO events (title, chef, type, event_date, wines, guests, notes, items)
      VALUES (${title}, ${chef}, ${type}, ${date}, ${wines}, ${guests}::jsonb, ${notes}, ${items}::jsonb)
      RETURNING *
    `;
    return res.status(201).json(eventRowToJson(rows[0]));
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
};
