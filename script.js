// Game state
let categories = {};
let currentCategory = null;
let currentWords = [];
let currentWordIndex = 0;

// Replace this with your public Gist ID
const GIST_ID = '3731fbbbbd3b475f3735cdc61c49a219';
const GIST_FILENAME = 'categories.json';

// DOM Elements
const categoryScreen = document.getElementById('category-screen');
const gameScreen = document.getElementById('game-screen');
const wordDisplay = document.getElementById('word-display');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const backToCategoriesBtn = document.getElementById('back-to-categories');
const categoryButtonsContainer = document.getElementById('category-buttons');

// Fetch categories from public GitHub Gist
async function loadCategories() {
    try {
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        
        // First, fetch the gist to get the raw URL
        const gistResponse = await fetch(`https://api.github.com/gists/${GIST_ID}?timestamp=${timestamp}`, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        if (!gistResponse.ok) throw new Error('Failed to fetch gist metadata');
        const gistData = await gistResponse.json();
        
        // Get the raw URL from the gist data and add cache-busting parameter
        const rawUrl = new URL(gistData.files[GIST_FILENAME].raw_url);
        rawUrl.searchParams.append('timestamp', timestamp);
        
        // Fetch the actual content
        const response = await fetch(rawUrl.toString(), {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        if (!response.ok) throw new Error('Failed to load categories');
        categories = await response.json();
        createCategoryButtons();
    } catch (error) {
        console.error('Error loading categories:', error);
        // Fallback to local categories if Gist fails to load
        const response = await fetch('categories.json');
        categories = await response.json();
        createCategoryButtons();
    }
}

// Create category buttons dynamically
function createCategoryButtons() {
    categoryButtonsContainer.innerHTML = ''; // Clear existing buttons
    
    Object.entries(categories).forEach(([key, category]) => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.dataset.category = key;
        button.textContent = category.name;
        button.addEventListener('click', () => {
            currentCategory = key;
            startGame(currentCategory);
        });
        categoryButtonsContainer.appendChild(button);
    });
}

// Start game for selected category
function startGame(category) {
    // Shuffle words
    currentWords = [...categories[category].words].sort(() => Math.random() - 0.5);
    currentWordIndex = 0;
    
    // Switch screens
    categoryScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    // Display first word
    displayCurrentWord();
}

// Display current word
function displayCurrentWord() {
    wordDisplay.textContent = currentWords[currentWordIndex];
}

// Next word
nextBtn.addEventListener('click', () => {
    currentWordIndex = (currentWordIndex + 1) % currentWords.length;
    displayCurrentWord();
});

// Previous word
prevBtn.addEventListener('click', () => {
    currentWordIndex = (currentWordIndex - 1 + currentWords.length) % currentWords.length;
    displayCurrentWord();
});

// Back to categories
backToCategoriesBtn.addEventListener('click', () => {
    gameScreen.classList.remove('active');
    categoryScreen.classList.add('active');
});

// Tap to next word (mobile-friendly)
wordDisplay.addEventListener('click', () => {
    currentWordIndex = (currentWordIndex + 1) % currentWords.length;
    displayCurrentWord();
});

// Load categories when the page loads
loadCategories();
