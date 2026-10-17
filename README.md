# Hangeul Cards · 한글 카드

A Korean-inspired flashcard app for beginners. Pick a deck, flip cards to see the
romanization and English meaning, and press 🔊 to hear each word.

- 6 decks × 12 words: Greetings, Numbers, Food, Family, Colors, Everyday Words
- Flip, Prev/Next, Shuffle, progress counter
- Pronunciation with the browser's built-in Korean voice (no API key)
- Responsive, with automatic dark mode
- Keyboard: **Space** flip · **← →** move · **Esc** back to categories

## Run it on your computer

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm start
```

Then open <http://localhost:3000>.

> Opening `public/index.html` directly (double-clicking it) won't load the words,
> because browsers block loading files that way. Always use `npm start`.

## Project structure

```
package.json        project info + the one dependency (express)
server.js           Express server: serves public/ and the /api/words API
public/index.html   page structure
public/style.css    Korean-inspired design + dark mode
public/script.js    flip, navigation, shuffle, pronunciation
public/words.json   the vocabulary (edit this to add words!)
public/images/      put seoul.jpg here (the background photo)
.github/workflows/pages.yml   publishes public/ to GitHub Pages
```

## Background photo of Seoul

The page uses a full-screen photo from `public/images/seoul.jpg`.
If that file is missing, the app falls back to the plain hanji-paper background.

To add (or change) the photo:

1. Pick a free landscape photo of Seoul on Unsplash, for example
   <https://unsplash.com/s/photos/seoul-skyline?orientation=landscape>.
2. Click **Download** and choose the **Large (1920 px)** size, which is Full HD.
3. Rename the file to `seoul.jpg` and put it in `public/images/`.
4. Optional: shrink it at <https://squoosh.app> (MozJPEG, quality ~75) to
   about 300–500 KB so the page loads fast on phones.

Unsplash photos are free to use. Crediting the photographer is appreciated but
not required. You can add it to the footer in `public/index.html`.

## API

| Route                    | Returns                         |
| ------------------------ | ------------------------------- |
| `GET /api/words`         | All categories and words        |
| `GET /api/words/:id`     | One category, e.g. `/api/words/food` |

## Add or change words

Edit `public/words.json`. Each word looks like this:

```json
{ "korean": "사과", "romanization": "sagwa", "english": "Apple" }
```

To add a new deck, copy an existing category block and give it a new unique `id`.
Restart the server (`Ctrl + C`, then `npm start`) to see the changes locally.

## Deploy

### 1. Put the project on GitHub

```bash
git init
git add .
git commit -m "Hangeul Cards"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/hangeul-cards.git
git push -u origin main
```

### 2. GitHub Pages (static, fast, free)

1. In your repo, open **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push any commit (or run the workflow from the **Actions** tab).
4. The site will be at `https://YOUR-USERNAME.github.io/hangeul-cards/`.

### 3. Render (full Express server, free tier)

1. Sign in at [render.com](https://render.com) with GitHub.
2. **New → Web Service** → pick your `hangeul-cards` repo.
3. Settings:
   - **Runtime:** Node
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Instance type:** Free
4. Click **Deploy**. Every push to `main` redeploys automatically.

Note: Render's free tier sleeps after ~15 minutes without visitors, so the first
visit afterwards can take 30–50 seconds. The GitHub Pages version has no such delay.

## Pronunciation note

The 🔊 button uses your device's built-in Korean voice. It works in Chrome, Edge,
and Safari on most devices. If a device has no Korean voice installed, the button
is hidden automatically.
