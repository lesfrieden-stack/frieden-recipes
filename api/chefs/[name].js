const { sql } = require('@vercel/postgres');

const DEFAULT_CHEF = 'Deborah Frieden';

module.exports = async function handler(req, res) {
  const name = decodeURIComponent(req.query.name || '');
  if (!name) {
    return res.status(400).json({ error: 'Chef name is required' });
  }
  if (name === DEFAULT_CHEF) {
    return res.status(400).json({ error: `Cannot modify the default chef ${DEFAULT_CHEF}` });
  }

  if (req.method === 'PUT') {
    const newName = ((req.body || {}).newName || '').trim();
    if (!newName) {
      return res.status(400).json({ error: 'newName is required' });
    }

    await sql`UPDATE chefs SET name = ${newName} WHERE name = ${name}`;
    await sql`UPDATE recipes SET chef = ${newName} WHERE chef = ${name}`;
    await sql`UPDATE events SET chef = ${newName} WHERE chef = ${name}`;
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    await sql`UPDATE recipes SET chef = ${DEFAULT_CHEF} WHERE chef = ${name}`;
    await sql`UPDATE events SET chef = ${DEFAULT_CHEF} WHERE chef = ${name}`;
    await sql`DELETE FROM chefs WHERE name = ${name}`;
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', 'PUT, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
};
