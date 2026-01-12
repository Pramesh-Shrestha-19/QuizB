// Category configurations
const categoryConfig = {
    general: {
        name: "General Knowledge",
        themes: [
            { id: "world", name: "World Events", icon: "🌍", desc: "Current affairs and global happenings" },
            { id: "science", name: "Science Basics", icon: "🔬", desc: "Fundamental scientific principles" },
            { id: "mixed", name: "Mixed General", icon: "🎯", desc: "Variety of general topics" }
        ]
    },
    science: {
        name: "Science & Tech",
        themes: [
            { id: "physics", name: "Physics & Chemistry", icon: "⚛️", desc: "Laws of nature and matter" },
            { id: "biology", name: "Biology & Medicine", icon: "🧬", desc: "Life sciences and health" },
            { id: "technology", name: "Technology & Innovation", icon: "💻", desc: "Modern tech and inventions" }
        ]
    },
    sports: {
        name: "Sports Trivia",
        themes: [
            { id: "football", name: "Football Focus", icon: "⚽", desc: "Premier League, World Cup, Champions League" },
            { id: "basketball", name: "Basketball Trivia", icon: "🏀", desc: "NBA, legends, championships & more" },
            { id: "mixed", name: "Mixed Sports Challenge", icon: "🎯", desc: "All sports combined - the ultimate test!" }
        ]
    },
    geography: {
        name: "Geography",
        themes: [
            { id: "capitals", name: "Countries & Capitals", icon: "🏛️", desc: "World capitals and nations" },
            { id: "landmarks", name: "Landmarks & Places", icon: "🗿", desc: "Famous sites around the globe" },
            { id: "flags", name: "Maps & Flags", icon: "🚩", desc: "National symbols and geography" }
        ]
    },
    entertainment: {
        name: "Entertainment",
        themes: [
            { id: "movies", name: "Movies & TV", icon: "🎬", desc: "Films, shows, and pop culture" },
            { id: "music", name: "Music", icon: "🎵", desc: "Artists, songs, and genres" },
            { id: "gaming", name: "Gaming", icon: "🎮", desc: "Video games and gaming culture" }
        ]
    },
    history: {
        name: "History & Politics",
        themes: [
            { id: "ancient", name: "Ancient History", icon: "🏺", desc: "Civilizations and early world" },
            { id: "modern", name: "Modern History", icon: "📰", desc: "Recent centuries and events" },
            { id: "wars", name: "World Wars", icon: "⚔️", desc: "Major conflicts and battles" }
        ]
    },
    food: {
        name: "Food & Drink",
        themes: [
            { id: "cuisines", name: "Cuisines", icon: "🍜", desc: "World cooking styles" },
            { id: "ingredients", name: "Ingredients", icon: "🥘", desc: "Foods and their origins" },
            { id: "cooking", name: "Cooking", icon: "👨‍🍳", desc: "Techniques and recipes" }
        ]
    },
    art: {
        name: "Art & Literature",
        themes: [
            { id: "books", name: "Books", icon: "📖", desc: "Novels, authors, and stories" },
            { id: "artists", name: "Famous Artists", icon: "🎨", desc: "Painters and their works" },
            { id: "poetry", name: "Poetry", icon: "✒️", desc: "Poems and poets" }
        ]
    },
    mythology: {
        name: "Mythology & Legends",
        themes: [
            { id: "greek", name: "Greek/Roman", icon: "⚡", desc: "Gods and heroes of antiquity" },
            { id: "norse", name: "Norse", icon: "🔨", desc: "Vikings and Nordic legends" },
            { id: "world", name: "World Myths", icon: "🐉", desc: "Global mythological tales" }
        ]
    }
};

// Difficulty configurations
const difficultyConfig = {
    easy: { label: "Easy", count: "10Q", color: "easy" },
    medium: { label: "Medium", count: "15Q", color: "medium" },
    hard: { label: "Hard", count: "20Q", color: "hard" },
    devilish: { label: "Devilish 😈", count: "100Q", color: "devilish" }
};

// Special question counts for specific themes
const specialCounts = {
    'sports-mixed': { easy: 12, medium: 18, hard: 25 }
};

let currentCategory = null;
let devilishUnlocked = false;

// Get modal elements
const modal = document.getElementById('quiz-modal');
const modalTitle = document.getElementById('modal-title');
const themeContainer = document.getElementById('theme-container');
const surpriseBtn = document.getElementById('surprise-btn');
const modalClose = document.querySelector('.modal-close');
const blurOverlay = document.getElementById('blur-overlay');

// Open modal when category is clicked
document.querySelectorAll('.section').forEach(section => {
    const playBtn = section.querySelector('.Play_button');
    playBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const category = section.dataset.category;
        openModal(category);
    });
});

// Close modal
modalClose.addEventListener('click', closeModal);

// Easter egg - click on theme icon/emoji to unlock Devilish mode
// This will be added dynamically when themes are rendered

// Surprise Me button
surpriseBtn.addEventListener('click', () => {
    if (!currentCategory) return;
    
    const config = categoryConfig[currentCategory];
    const randomTheme = config.themes[Math.floor(Math.random() * config.themes.length)];
    const difficulties = devilishUnlocked ? ['easy', 'medium', 'hard', 'devilish'] : ['easy', 'medium', 'hard'];
    const randomDiff = difficulties[Math.floor(Math.random() * difficulties.length)];
    
    startQuiz(currentCategory, randomTheme.id, randomDiff);
});

function openModal(category) {
    currentCategory = category;
    const config = categoryConfig[category];
    
    if (!config) {
        console.error('Unknown category:', category);
        return;
    }
    
    // Update modal title (removed asterisk since logo is now the easter egg)
    modalTitle.innerHTML = `Choose Your ${config.name} Challenge`;
    
    // Close sidebar if open
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.remove('open');
    
    // Render themes
    renderThemes(config.themes);
    
    // Show modal
    modal.classList.add('active');
    blurOverlay.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
    blurOverlay.classList.remove('active');
    currentCategory = null;
    devilishUnlocked = false;
}

function renderThemes(themes) {
    themeContainer.innerHTML = '';
    
    themes.forEach(theme => {
        const card = document.createElement('div');
        card.className = 'theme-card';
        
        const header = document.createElement('div');
        header.className = 'theme-header';
        
        const icon = document.createElement('div');
        icon.className = 'theme-icon';
        icon.textContent = theme.icon;
        icon.style.cursor = 'pointer';
        icon.title = 'Click me for a surprise! 😈';
        
        // Easter egg - click icon to unlock Devilish mode
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            unlockDevilish();
        });
        
        const info = document.createElement('div');
        info.className = 'theme-info';
        info.innerHTML = `
            <h3>${theme.name}</h3>
            <p>${theme.desc}</p>
        `;
        
        header.appendChild(icon);
        header.appendChild(info);
        
        const badges = document.createElement('div');
        badges.className = 'difficulty-badges';
        
        // Add standard difficulties
        ['easy', 'medium', 'hard'].forEach(diff => {
            const badge = createDifficultyBadge(theme.id, diff);
            badges.appendChild(badge);
        });
        
        card.appendChild(header);
        card.appendChild(badges);
        themeContainer.appendChild(card);
    });
}

function createDifficultyBadge(themeId, difficulty) {
    const config = difficultyConfig[difficulty];
    const badge = document.createElement('div');
    badge.className = `difficulty-badge ${config.color}`;
    
    // Get question count (check for special counts)
    const specialKey = `${currentCategory}-${themeId}`;
    let count = config.count;
    if (specialCounts[specialKey] && specialCounts[specialKey][difficulty]) {
        count = `${specialCounts[specialKey][difficulty]}Q`;
    }
    
    badge.innerHTML = `
        <span class="badge-title">${config.label}</span>
        <span class="badge-count">${count}</span>
    `;
    
    badge.addEventListener('click', () => {
        startQuiz(currentCategory, themeId, difficulty);
    });
    
    return badge;
}

function unlockDevilish() {
    if (devilishUnlocked) return;
    
    devilishUnlocked = true;
    
    // Add devilish badge to all theme cards
    document.querySelectorAll('.difficulty-badges').forEach(badges => {
        const themeCard = badges.closest('.theme-card');
        const themeIndex = Array.from(themeContainer.children).indexOf(themeCard);
        const theme = categoryConfig[currentCategory].themes[themeIndex];
        
        const devilishBadge = document.createElement('div');
        devilishBadge.className = 'difficulty-badge devilish';
        devilishBadge.innerHTML = `
            <span class="badge-title">Devilish 😈</span>
            <span class="badge-count">100Q</span>
        `;
        
        devilishBadge.addEventListener('click', () => {
            startQuiz(currentCategory, theme.id, 'devilish');
        });
        
        badges.appendChild(devilishBadge);
    });
    
    // Visual feedback
    modalTitle.style.animation = 'pulse 0.5s ease';
    setTimeout(() => {
        modalTitle.style.animation = '';
    }, 500);
}

function startQuiz(category, theme, difficulty) {
    // Build the URL with parameters
    const url = `quiz.html?cat=${category}&theme=${theme}&diff=${difficulty}`;
    window.location.href = url;
}

// Close modal when clicking outside
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});