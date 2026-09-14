// Maps between Postgres rows (snake_case) and the JSON shape the frontend
// already expects (PascalCase field names, matching the old PRELOADED_RECIPES format).

function recipeRowToJson(row) {
  return {
    id: row.id,
    Title: row.title,
    Chef: row.chef,
    Category: row.category,
    mealType: row.meal_type,
    Description: row.description,
    Servings: row.servings,
    Ingredients: row.ingredients,
    Instructions: row.instructions,
    photo: row.photo_url || ''
  };
}

function eventRowToJson(row) {
  return {
    id: row.id,
    title: row.title,
    chef: row.chef,
    type: row.type,
    date: row.event_date,
    wines: row.wines,
    guests: row.guests,
    notes: row.notes,
    items: row.items
  };
}

module.exports = { recipeRowToJson, eventRowToJson };
