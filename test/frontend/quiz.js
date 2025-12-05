
const params = new URLSearchParams(window.location.search);
const category = (params.get('cat') || 'general').toLowerCase();

const categoryLabelEl = document.getElementById('category-label');
const progressEl = document.getElementById('progress');
const questionText = document.getElementById('question-text');
const optionsBox = document.getElementById('options');
const nextBtn = document.getElementById('next-btn');
const quitBtn = document.getElementById('quit-btn');
const resultBox = document.getElementById('result-box');
const scoreText = document.getElementById('score-text');
const timeText = document.getElementById('time-text');
const retryBtn = document.getElementById('retry-btn');
const backBtn = document.getElementById('back-btn');

let questions = [];                                                                         // Array to store the questions when fetched later.
let currentIndex = 0;                                                                       // Keeps track of which question the user is currently on.
let score = 0;                                                                              // Stores the user’s score.
let startTime = 0;                                                                          // Stores the time at which the quiz starts.

categoryLabelEl.textContent = `Category: ${category}`;

function showError(msg) {
  questionText.textContent = msg;
  optionsBox.innerHTML = '';
  nextBtn.disabled = true;
}

// load question file
async function loadQuestions() {
  try {
    const res = await fetch(`./questions/${category}.json`);
    if (!res.ok) throw new Error(`No question file for category "${category}"`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      showError('No questions found.');
      return;
    }
    questions = data;
    currentIndex = 0;
    score = 0;
    startTime = Date.now();
    renderQuestion();
  } catch (err) {
    showError('Could not load questions: ' + err.message);
  }
}

function renderQuestion() {
  nextBtn.disabled = true;
  const q = questions[currentIndex];
  progressEl.textContent = `${currentIndex + 1} / ${questions.length}`;
  questionText.textContent = q.question;
  optionsBox.innerHTML = '';                                                                // Clear the option box.

  q.options.forEach((opt, idx) => {
    const b = document.createElement('button');
    b.className = 'option-btn';
    b.textContent = opt;
    b.type = 'button';
    b.onclick = () => handleAnswer(idx, b);
    optionsBox.appendChild(b);
  });
}

function handleAnswer(selectedIndex, btnEl) {
  // disable all options
  const optionButtons = Array.from(document.querySelectorAll('.option-btn'));                // gets all answer buttons on the current question.converts it from a NodeList to an actual array so we can use .forEach. disables all buttons so the user cannot click multiple answers.
  optionButtons.forEach(b => b.disabled = true);

  const correctIndex = questions[currentIndex].answer;
  if (selectedIndex === correctIndex) {
    btnEl.classList.add('correct');
    score++;
  } else {
    btnEl.classList.add('wrong');
    // highlight correct
    optionButtons[correctIndex].classList.add('correct');
  }

  nextBtn.disabled = false;
}

nextBtn.addEventListener('click', () => {
  currentIndex++;
  if (currentIndex >= questions.length) {
    showResult();
  } else {
    renderQuestion();
  }
});

quitBtn.addEventListener('click', () => {
  if (confirm('Quit quiz and go back to categories?')) {
    window.location.href = 'category.html';
  }
});

retryBtn && retryBtn.addEventListener('click', () => {
  // restart
  resultBox.style.display = 'none';
  document.getElementById('question-box').style.display = 'block';
  currentIndex = 0;
  score = 0;
  startTime = Date.now();
  renderQuestion();
});

backBtn && backBtn.addEventListener('click', () => {
  window.location.href = 'category.html';
});

function showResult() {
  document.getElementById('question-box').style.display = 'none';
  resultBox.style.display = 'block';

  const elapsedSec = Math.round((Date.now() - startTime) / 1000);                         // Divison by 1000 becuase date.now give time in millisecond.
  scoreText.textContent = `${score} / ${questions.length}`;
  timeText.textContent = `Time: ${elapsedSec} seconds`;

  // Optional: you can send result to backend if you later add save_score.php
  // sendResultToBackend(score, questions.length, category, elapsedSec);
}

// Optional function (not active): shows how to save score to backend
async function sendResultToBackend(score, total, category, timeTakenSec) {
  // Do not use until you add a save_score.php endpoint
  try {
    const resp = await fetch('../backend/save_score.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, total, category, timeTakenSec })
    });
    const j = await resp.json();
    console.log('save result response', j);
  } catch (err) {
    console.warn('Could not send result to backend', err);
  }
}

loadQuestions();
