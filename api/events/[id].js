const { sql } = require('@vercel/postgres');
const { eventRowToJson } = require('../../lib/db');

module.exports = async function handler(req, res) {
  const id = parseInt(req.query.id, 10);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Invalid event id' });
  }

  if (req.method === 'PUT') {
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
      UPDATE events SET
        title = ${title},
        chef = ${chef},
        type = ${type},
        event_date = ${date},
        wines = ${wines},
        guests = ${guests}::jsonb,
        notes = ${notes},
        items = ${items}::jsonb,
        updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `;
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    return res.status(200).json(eventRowToJson(rows[0]));
  }

  if (req.method === 'DELETE') {
    const { rows } = await sql`DELETE FROM events WHERE id = ${id} RETURNING id`;
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', 'PUT, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
};
