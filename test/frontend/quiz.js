const params = new URLSearchParams(window.location.search);
const category = (params.get('cat') || 'general').toLowerCase();
const theme = (params.get('theme') || '').toLowerCase();
const difficulty = (params.get('diff') || 'medium').toLowerCase();

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

let questions = [];
let currentIndex = 0;
let score = 0;
let startTime = 0;

// Build the filename based on parameters
function getQuestionFile() {
    if (theme && difficulty) {
        // Format: questions/category/theme/difficulty.json 
        // (e.g., questions/entertainment/gaming/easy.json)
        return `./questions/${category}/${theme}/${difficulty}.json`;
    } else if (difficulty) {
        // Format: category/difficulty.json (e.g., questions/general/easy.json)
        return `./questions/${category}/${difficulty}.json`;
    } else {
        // Fallback: just category.json
        return `./questions/${category}.json`;
    }
}

// Update category label with theme and difficulty info
function updateCategoryLabel() {
    let label = `Category: ${category}`;
    
    if (theme) {
        label += ` - ${theme}`;
    }
    
    if (difficulty) {
        const diffLabels = {
            easy: '★ Easy',
            medium: '★★ Medium',
            hard: '★★★ Hard',
            devilish: '💀 DEVILISH'
        };
        label += ` (${diffLabels[difficulty] || difficulty})`;
    }
    
    categoryLabelEl.textContent = label;
    
    // Add special styling for devilish mode
    if (difficulty === 'devilish') {
        categoryLabelEl.style.color = '#9C27B0';
        categoryLabelEl.style.textShadow = '0 0 10px rgba(156, 39, 176, 0.5)';
    }
}

function showError(msg) {
    questionText.textContent = msg;
    optionsBox.innerHTML = '';
    nextBtn.disabled = true;
}

// Load question file
async function loadQuestions() {
    try {
        const questionFile = getQuestionFile();
        const res = await fetch(questionFile);
        
        if (!res.ok) {
            throw new Error(`No question file found: ${questionFile}`);
        }
        
        const data = await res.json();
        
        if (!Array.isArray(data) || data.length === 0) {
            showError('No questions found in this category.');
            return;
        }
        
        questions = data;
        currentIndex = 0;
        score = 0;
        startTime = Date.now();
        updateCategoryLabel();
        renderQuestion();
    } catch (err) {
        showError('Could not load questions: ' + err.message);
        console.error('Question loading error:', err);
    }
}

function renderQuestion() {
    nextBtn.disabled = true;
    const q = questions[currentIndex];
    progressEl.textContent = `${currentIndex + 1} / ${questions.length}`;
    questionText.textContent = q.question;
    optionsBox.innerHTML = '';

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
    const optionButtons = Array.from(document.querySelectorAll('.option-btn'));
    optionButtons.forEach(b => b.disabled = true);

    const correctIndex = questions[currentIndex].answer;
    if (selectedIndex === correctIndex) {
        btnEl.classList.add('correct');
        score++;
    } else {
        btnEl.classList.add('wrong');
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
        window.location.href = 'categories.html';
    }
});

retryBtn && retryBtn.addEventListener('click', () => {
    resultBox.style.display = 'none';
    document.getElementById('question-box').style.display = 'block';
    currentIndex = 0;
    score = 0;
    startTime = Date.now();
    renderQuestion();
});

backBtn && backBtn.addEventListener('click', () => {
    window.location.href = "categories.html";
});

function showResult() {
    document.getElementById('question-box').style.display = 'none';

    const percentage = Math.round((score / questions.length) * 100);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    
    let resultMessage = '';
    if (difficulty === 'devilish') {
        if (percentage >= 90) {
            resultMessage = '<p style="color: #9C27B0; font-size: 20px;">🔥 LEGENDARY! You conquered the Devilish challenge! 🔥</p>';
        } else if (percentage >= 70) {
            resultMessage = '<p style="color: #9C27B0;">Impressive! You survived the Devilish mode!</p>';
        } else {
            resultMessage = '<p style="color: #9C27B0;">The Devilish challenge was too much... Try again?</p>';
        }
    } else if (percentage >= 80) {
        resultMessage = '<p style="color: #4CAF50;">🎉 Excellent work!</p>';
    } else if (percentage >= 60) {
        resultMessage = '<p style="color: #FFA500;">👍 Good job!</p>';
    } else {
        resultMessage = '<p style="color: #FF5722;">Keep practicing!</p>';
    }

    scoreText.innerHTML = `${resultMessage}<strong>Score:</strong> ${score} / ${questions.length} (${percentage}%)`;
    timeText.innerHTML = `<strong>Time:</strong> ${timeTaken} seconds`;

    resultBox.style.display = 'block';
}

// Optional function: save score to backend
async function sendResultToBackend(score, total, category, timeTakenSec) {
    try {
        const resp = await fetch('../backend/save_score.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                score, 
                total, 
                category, 
                theme,
                difficulty,
                timeTakenSec 
            })
        });
        const j = await resp.json();
        console.log('save result response', j);
    } catch (err) {
        console.warn('Could not send result to backend', err);
    }
}

loadQuestions();