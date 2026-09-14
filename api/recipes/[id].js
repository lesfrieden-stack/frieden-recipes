const { sql } = require('@vercel/postgres');
const { recipeRowToJson } = require('../../lib/db');

module.exports = async function handler(req, res) {
  const id = parseInt(req.query.id, 10);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Invalid recipe id' });
  }

  if (req.method === 'PUT') {
    const body = req.body || {};
    const title = (body.Title || '').trim();
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const duplicate = await sql`
      SELECT id FROM recipes WHERE lower(title) = lower(${title}) AND id != ${id}
    `;
    if (duplicate.rows.length > 0) {
      return res.status(409).json({ error: 'A recipe with this title already exists' });
    }

    const chef = body.Chef || 'Deborah Frieden';
    const category = body.Category || 'Uncategorized';
    const mealType = body.mealType || 'Dinner';
    const description = body.Description || '';
    const servings = body.Servings || '';
    const ingredients = JSON.stringify(body.Ingredients || []);
    const instructions = JSON.stringify(body.Instructions || []);
    const photoUrl = body.photo || null;

    const { rows } = await sql`
      UPDATE recipes SET
        title = ${title},
        chef = ${chef},
        category = ${category},
        meal_type = ${mealType},
        description = ${description},
        servings = ${servings},
        ingredients = ${ingredients}::jsonb,
        instructions = ${instructions}::jsonb,
        photo_url = ${photoUrl},
        updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `;
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    return res.status(200).json(recipeRowToJson(rows[0]));
  }

  if (req.method === 'DELETE') {
    const { rows } = await sql`DELETE FROM recipes WHERE id = ${id} RETURNING id`;
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', 'PUT, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
};
