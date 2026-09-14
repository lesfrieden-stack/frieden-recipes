const { sql } = require('@vercel/postgres');
const { recipeRowToJson } = require('../../lib/db');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const { rows } = await sql`SELECT * FROM recipes ORDER BY title ASC`;
    return res.status(200).json(rows.map(recipeRowToJson));
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const title = (body.Title || '').trim();
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const chef = body.Chef || 'Deborah Frieden';
    const category = body.Category || 'Uncategorized';
    const mealType = body.mealType || 'Dinner';
    const description = body.Description || '';
    const servings = body.Servings || '';
    const ingredients = JSON.stringify(body.Ingredients || []);
    const instructions = JSON.stringify(body.Instructions || []);
    const photoUrl = body.photo || null;

    const existing = await sql`SELECT id FROM recipes WHERE lower(title) = lower(${title})`;
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'A recipe with this title already exists' });
    }

    const { rows } = await sql`
      INSERT INTO recipes (title, chef, category, meal_type, description, servings, ingredients, instructions, photo_url)
      VALUES (${title}, ${chef}, ${category}, ${mealType}, ${description}, ${servings}, ${ingredients}::jsonb, ${instructions}::jsonb, ${photoUrl})
      RETURNING *
    `;
    return res.status(201).json(recipeRowToJson(rows[0]));
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
};
