// One-time migration: creates tables (if missing) and loads data/preloaded-recipes.json
// into Postgres. Safe to re-run — existing titles are skipped.
//
// Usage: npm run seed
// Requires POSTGRES_URL in .env.local (see README steps for `vercel env pull`).

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Minimal .env.local loader (no extra dependency needed)
const envPath = path.join(projectRoot, '.env.local');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (!(key in process.env)) process.env[key] = value;
  }
} else {
  console.error('Missing .env.local. Run `vercel env pull .env.local` first.');
  process.exit(1);
}

const { sql } = await import('@vercel/postgres');

// Mirrors the client-side categorization the old site used to backfill
// meal types for recipes that never had one set explicitly.
function getMealTypeFromCategory(category) {
  if (!category) return 'Dinner';
  const cat = category.toLowerCase();
  if (cat.includes('breakfast')) return 'Breakfast';
  if (cat.includes('lunch') || cat.includes('sandwich')) return 'Lunch';
  if (cat.includes('bread') || cat.includes('jam')) return 'Brunch';
  if (cat.includes('appetizer') || cat.includes('drink')) return 'Cocktail Party';
  if (cat.includes('dessert')) return 'Dinner Party';
  return 'Dinner';
}

async function main() {
  const schema = readFileSync(path.join(projectRoot, 'sql', 'schema.sql'), 'utf8');
  // Run each statement separately (the sql tag only allows one statement at a time)
  const statements = schema.split(';').map((s) => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    await sql.query(stmt);
  }
  console.log('Schema ensured.');

  const recipes = JSON.parse(
    readFileSync(path.join(projectRoot, 'data', 'preloaded-recipes.json'), 'utf8')
  );

  let inserted = 0;
  let skipped = 0;
  for (const r of recipes) {
    const title = (r.Title || '').trim();
    if (!title) continue;

    const existing = await sql`SELECT id FROM recipes WHERE lower(title) = lower(${title})`;
    if (existing.rows.length > 0) {
      skipped++;
      continue;
    }

    const chef = r.Chef || 'Deborah Frieden';
    const category = r.Category || 'Uncategorized';
    const mealType = r.mealType || getMealTypeFromCategory(category);
    const description = r.Description || '';
    const servings = r.Servings || '';
    const ingredients = JSON.stringify(r.Ingredients || []);
    const instructions = JSON.stringify(r.Instructions || []);

    await sql`
      INSERT INTO recipes (title, chef, category, meal_type, description, servings, ingredients, instructions)
      VALUES (${title}, ${chef}, ${category}, ${mealType}, ${description}, ${servings}, ${ingredients}::jsonb, ${instructions}::jsonb)
    `;
    inserted++;
  }
  console.log(`Recipes inserted: ${inserted}, skipped (already present): ${skipped}`);

  const chefNames = new Set(recipes.map((r) => r.Chef || 'Deborah Frieden'));
  chefNames.add('Deborah Frieden');
  for (const name of chefNames) {
    await sql`INSERT INTO chefs (name) VALUES (${name}) ON CONFLICT (name) DO NOTHING`;
  }
  console.log(`Chefs ensured: ${[...chefNames].join(', ')}`);
}

main()
  .then(() => {
    console.log('Seed complete.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
