// Hangeul Cards — frontend logic
// Flow: load words.json → show category tiles → study one deck with a flip card.

// ---------- App state ----------
const state = {
  categories: [], // all categories from words.json
  deck: [],       // words of the deck being studied (may be shuffled)
  index: 0,       // position of the current card in the deck
  flipped: false, // is the card showing its back?
};

// ---------- Page elements ----------
const $ = (id) => document.getElementById(id);

const els = {
  categoriesView: $('categories-view'),
  studyView: $('study-view'),
  status: $('status'),
  categoryGrid: $('category-grid'),
  backBtn: $('back-btn'),
  counter: $('counter'),
  deckKorean: $('deck-korean'),
  deckName: $('deck-name'),
  progressBar: $('progress-bar'),
  cardScene: $('card-scene'),
  card: $('card'),
  cardFront: $('card-front'),
  cardBack: $('card-back'),
  frontKorean: $('front-korean'),
  backKorean: $('back-korean'),
  backRoman: $('back-roman'),
  backEnglish: $('back-english'),
  prevBtn: $('prev-btn'),
  nextBtn: $('next-btn'),
  shuffleBtn: $('shuffle-btn'),
  speakBtn: $('speak-btn'),
};

// Small helper: create an element with a class and text
function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

// ---------- Loading the words ----------
async function loadWords() {
  try {
    // Relative path: works on Express (localhost / Render) and on GitHub Pages
    const response = await fetch('words.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    state.categories = data.categories;

    renderCategories();
    els.status.hidden = true;
  } catch (error) {
    console.error('Could not load words.json:', error);
    els.status.textContent =
      'Could not load the word list. If you opened index.html directly from your files, ' +
      'run "npm start" and visit http://localhost:3000 instead.';
    els.status.classList.add('error');
  }
}

// ---------- Category view ----------
function renderCategories() {
  els.categoryGrid.innerHTML = '';

  state.categories.forEach((category) => {
    const tile = createEl('button', 'category-tile');
    tile.type = 'button';

    const korean = createEl('span', 'tile-korean', category.korean);
    korean.lang = 'ko';

    tile.append(
      korean,
      createEl('span', 'tile-name', category.name),
      createEl('span', 'tile-desc', category.description),
      createEl('span', 'tile-meta', `${category.words.length} words`)
    );

    tile.addEventListener('click', () => openDeck(category));
    els.categoryGrid.append(tile);
  });
}

function showCategories() {
  stopSpeaking();
  els.studyView.hidden = true;
  els.categoriesView.hidden = false;
  window.scrollTo(0, 0);
}

// ---------- Study view ----------
function openDeck(category) {
  state.deck = [...category.words]; // copy, so shuffling never changes the original order
  state.index = 0;

  els.deckKorean.textContent = category.korean;
  els.deckName.textContent = category.name;

  els.categoriesView.hidden = true;
  els.studyView.hidden = false;
  window.scrollTo(0, 0);

  showCard();
}

// Draw the current card and update counter, progress bar and buttons
function showCard() {
  const word = state.deck[state.index];
  const total = state.deck.length;
  const isLast = state.index === total - 1;

  stopSpeaking();
  setFlipped(false, false); // always start a new card on its front, without animation

  els.frontKorean.textContent = word.korean;
  els.backKorean.textContent = word.korean;
  els.backRoman.textContent = word.romanization;
  els.backEnglish.textContent = word.english;

  els.counter.textContent = `Card ${state.index + 1} of ${total}`;
  els.progressBar.style.width = `${((state.index + 1) / total) * 100}%`;

  els.prevBtn.disabled = state.index === 0;
  els.nextBtn.textContent = isLast ? 'Start over ↺' : 'Next →';
}

// Flip the card. animate=false snaps it instantly (used when changing cards,
// so the answer of the next card is never revealed during a flip-back).
function setFlipped(flipped, animate = true) {
  state.flipped = flipped;

  if (!animate) els.card.classList.add('no-anim');
  els.card.classList.toggle('is-flipped', flipped);
  els.card.setAttribute('aria-pressed', String(flipped));

  // Screen readers should only read the visible side
  els.cardFront.setAttribute('aria-hidden', String(flipped));
  els.cardBack.setAttribute('aria-hidden', String(!flipped));

  if (!animate) {
    void els.card.offsetWidth; // force the browser to apply the change now
    els.card.classList.remove('no-anim');
  }
}

function toggleFlip() {
  setFlipped(!state.flipped);
}

function nextCard() {
  const isLast = state.index === state.deck.length - 1;
  state.index = isLast ? 0 : state.index + 1;
  showCard();
}

function prevCard() {
  if (state.index > 0) {
    state.index -= 1;
    showCard();
  }
}

// Fisher–Yates shuffle: a fair random order
function shuffleDeck() {
  for (let i = state.deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [state.deck[i], state.deck[j]] = [state.deck[j], state.deck[i]];
  }
  state.index = 0;
  showCard();

  // Small wiggle so the user sees something happened
  els.cardScene.classList.remove('shuffling');
  void els.cardScene.offsetWidth;
  els.cardScene.classList.add('shuffling');
}

// ---------- Pronunciation (browser's built-in voice) ----------
const canSpeak = 'speechSynthesis' in window;
let koreanVoice = null;

// Voices load asynchronously in some browsers, so this may run more than once.
function findKoreanVoice() {
  if (!canSpeak) return;
  const voices = window.speechSynthesis.getVoices();
  koreanVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('ko')) || null;
  els.speakBtn.hidden = !koreanVoice; // hide 🔊 if the device has no Korean voice
}

function speakCurrentWord() {
  if (!koreanVoice) return;
  const word = state.deck[state.index];

  window.speechSynthesis.cancel(); // stop anything still playing
  const utterance = new SpeechSynthesisUtterance(word.korean);
  utterance.voice = koreanVoice;
  utterance.lang = koreanVoice.lang;
  utterance.rate = 0.85; // a little slower for beginners

  utterance.onstart = () => els.speakBtn.classList.add('is-speaking');
  utterance.onend = () => els.speakBtn.classList.remove('is-speaking');
  utterance.onerror = () => els.speakBtn.classList.remove('is-speaking');

  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if (canSpeak) window.speechSynthesis.cancel();
  els.speakBtn.classList.remove('is-speaking');
}

// ---------- Events ----------
els.card.addEventListener('click', toggleFlip);
els.nextBtn.addEventListener('click', nextCard);
els.prevBtn.addEventListener('click', prevCard);
els.shuffleBtn.addEventListener('click', shuffleDeck);
els.speakBtn.addEventListener('click', speakCurrentWord);
els.backBtn.addEventListener('click', showCategories);

// Keyboard shortcuts while studying
document.addEventListener('keydown', (event) => {
  if (els.studyView.hidden) return;
  if (event.altKey || event.ctrlKey || event.metaKey) return;

  switch (event.key) {
    case 'ArrowRight':
      nextCard();
      break;
    case 'ArrowLeft':
      prevCard();
      break;
    case 'Escape':
      showCategories();
      break;
    case ' ':
    case 'Enter':
      // Real buttons handle Space/Enter themselves (e.g. pressing "Next")
      if (event.target.closest('button')) return;
      event.preventDefault(); // stop Space from scrolling the page
      toggleFlip();
      break;
  }
});

if (canSpeak) {
  findKoreanVoice();
  window.speechSynthesis.addEventListener('voiceschanged', findKoreanVoice);
}

// ---------- Start ----------
loadWords();
