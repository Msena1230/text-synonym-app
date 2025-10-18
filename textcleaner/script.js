document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const splashScreen = document.getElementById('splash-screen');
    const textInput = document.getElementById('text-input');
    const processButton = document.getElementById('process-button');
    const outputDisplay = document.getElementById('output-display');
    const historyList = document.getElementById('history-list');
    const clearHistoryButton = document.getElementById('clear-history-button');

    // --- Splash Screen Logic ---
    const line1 = document.getElementById('splash-text-line1');
    const line2 = document.getElementById('splash-text-line2');
    line1.textContent = line1.dataset.text;
    line2.textContent = line2.dataset.text;

    setTimeout(() => { line1.classList.add('active'); }, 200);
    setTimeout(() => { line2.classList.add('active'); }, 1700);
    setTimeout(() => { splashScreen.classList.add('hidden'); }, 3200);

    // --- State Variables ---
    let history = [];

    // --- Core Logic ---
    function cleanText() {
        const inputText = textInput.value;
        if (!inputText.trim()) return;

        // Allowed characters: English letters, numbers, spaces, and basic symbols
        const allowedChars = /^[a-zA-Z0-9 ()'#"!$%&,.;:?_\-=\+@\*]+$/;

        let cleanedHtml = '';
        for (const char of inputText) {
            if (allowedChars.test(char)) {
                cleanedHtml += char;
            } else {
                cleanedHtml += `<span class="invalid-char">${char}</span>`;
            }
        }

        outputDisplay.innerHTML = cleanedHtml;
        addHistoryItem(inputText);
    }

    processButton.addEventListener('click', cleanText);

    // --- History Logic ---
    function saveHistory() {
        localStorage.setItem('textCleanerHistory', JSON.stringify(history));
    }

    function renderHistory() {
        historyList.innerHTML = '';
        if (history.length === 0) {
            historyList.innerHTML = '<p class="placeholder">Your history will appear here.</p>';
            return;
        }

        history.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.textContent = item.substring(0, 50) + (item.length > 50 ? '...' : '');
            historyItem.addEventListener('click', () => {
                loadHistoryItem(index);
            });
            historyList.appendChild(historyItem);
        });
    }

    function addHistoryItem(text) {
        if (!text || !text.trim()) return;

        // Remove potential duplicates before adding
        const existingIndex = history.findIndex(item => item === text);
        if (existingIndex > -1) {
            history.splice(existingIndex, 1);
        }

        history.unshift(text); // Add to the beginning
        
        if (history.length > 100) { // Limit history size
            history = history.slice(0, 100);
        }

        saveHistory();
        renderHistory();
    }

    function loadHistoryItem(index) {
        textInput.value = history[index];
        cleanText();
        // Highlight the active item
        document.querySelectorAll('.history-item').forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
    }

    function clearHistory() {
        if (confirm('Are you sure you want to clear all history?')) {
            history = [];
            saveHistory();
            renderHistory();
        }
    }

    function loadHistory() {
        history = JSON.parse(localStorage.getItem('textCleanerHistory') || '[]');
        renderHistory();
    }

    clearHistoryButton.addEventListener('click', clearHistory);

    // --- Initialization ---
    loadHistory();
});