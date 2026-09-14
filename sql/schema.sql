-- Frieden Recipes database schema (Vercel Postgres)

CREATE TABLE IF NOT EXISTS recipes (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    chef TEXT NOT NULL DEFAULT 'Deborah Frieden',
    category TEXT NOT NULL DEFAULT 'Uncategorized',
    meal_type TEXT NOT NULL DEFAULT 'Dinner',
    description TEXT NOT NULL DEFAULT '',
    servings TEXT NOT NULL DEFAULT '',
    ingredients JSONB NOT NULL DEFAULT '[]',
    instructions JSONB NOT NULL DEFAULT '[]',
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chefs (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    chef TEXT NOT NULL DEFAULT 'Deborah Frieden',
    type TEXT NOT NULL DEFAULT '',
    event_date TEXT NOT NULL DEFAULT '',
    wines TEXT NOT NULL DEFAULT '',
    guests JSONB NOT NULL DEFAULT '[]',
    notes TEXT NOT NULL DEFAULT '',
    items JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes (category);
CREATE INDEX IF NOT EXISTS idx_recipes_chef ON recipes (chef);
