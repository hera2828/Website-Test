// server.js — a tiny Express server for Hangeul Cards.
//
// It does two jobs:
//   1. Serves everything inside the /public folder (HTML, CSS, JS, words.json).
//   2. Offers the vocabulary as a JSON API at /api/words.
//
// The frontend reads public/words.json with a relative path, so the same
// /public folder also works on GitHub Pages, where no server runs.

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Render provides PORT automatically
const PUBLIC_DIR = path.join(__dirname, 'public');

// The word list is read once at startup. Restart the server after editing it.
const WORDS = require('./public/words.json');

// 1) Serve the static frontend files
app.use(express.static(PUBLIC_DIR));

// 2) API: all categories with their words
app.get('/api/words', (req, res) => {
  res.json(WORDS);
});

// API: one category, e.g. /api/words/food
app.get('/api/words/:categoryId', (req, res) => {
  const category = WORDS.categories.find((c) => c.id === req.params.categoryId);

  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }

  res.json(category);
});

// Anything else is a 404
app.use((req, res) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, () => {
  console.log(`Hangeul Cards is running at http://localhost:${PORT}`);
});
