document.addEventListener('DOMContentLoaded', () => {
    // --- Splash Screen Logic ---
    const splashScreen = document.getElementById('splash-screen');
    const line1 = document.getElementById('splash-text-line1');
    const line2 = document.getElementById('splash-text-line2');

    line1.textContent = line1.dataset.text;
    line2.textContent = line2.dataset.text;

    setTimeout(() => {
        line1.classList.add('active');
    }, 200);

    setTimeout(() => {
        line2.classList.add('active');
    }, 1700);

    setTimeout(() => {
        splashScreen.classList.add('hidden');
    }, 3200);

    // --- DOM Elements ---
    const textInput = document.getElementById('text-input');
    const processButton = document.getElementById('process-button');
    const processedText = document.getElementById('processed-text');
    const suggestionList = document.getElementById('suggestion-list');
    const wordCounter = document.getElementById('word-counter');
    const historyList = document.getElementById('history-list');
    const clearHistoryButton = document.getElementById('clear-history-button');
    const settingsButton = document.getElementById('settings-button');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsModalButton = document.getElementById('close-settings-modal');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiKeyButton = document.getElementById('save-api-key');
    const themePreviewButtons = document.querySelectorAll('.theme-preview-button');
    const modelSelectButtons = document.querySelectorAll('.model-select-button');
    const layoutModeToggle = document.getElementById('layout-mode-toggle');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressMessage = document.getElementById('progress-message');

    // --- State Variables ---
    let geminiApiKey = '';
    let history = [];
    let activeHistoryId = null;
    let selectedModel = 'gemini-2.5-flash-lite';

    // --- Main Processing Logic ---
    processButton.addEventListener('click', async () => {
        if (!geminiApiKey) {
            alert('Please set your Gemini API key in the settings first.');
            openSettingsModal();
            return;
        }
        const text = textInput.value;
        if (!text.trim()) return;

        showProgressBar();
        setProgress(10, 'Initiating two-step humanization...');

        try {
            const integratedPrompt = `
Analyze the following English text. Your task is to perform a two-step process to make it sound more natural and human-written. Execute the steps sequentially.

**Step 1: Grammar Correction**
1.  Correct any grammatical errors, spelling mistakes, or awkward phrasing to improve fluency. This step should focus on minimal corrections to ensure correctness without altering the original meaning or style significantly.

**Step 2: Structural Transformation**
1.  Take the result from Step 1.
2.  Identify approximately 60% of the sentences in the Step 1 result.
3.  For these selected sentences, apply ONE of the following transformations, only if the result is natural and preserves the core meaning:
    a.  Change the voice from active to passive, or passive to active.
    b.  Change the tense in a way that preserves the original meaning (e.g., "he walked" to "he has walked").

**Final Output Requirement:**
Return a single, valid JSON object. This object must have two keys:
- "final_text": A string containing the complete, final text after both steps are completed.
- "changes": An array of objects detailing every single modification made across both steps. Each object must have:
    - "step": The step in which the change was made (e.g., "Step 1: Grammar" or "Step 2: Voice Change").
    - "original": The original word or sentence fragment.
    - "changed": The modified word or sentence fragment.
    - "explanation": A brief, clear explanation of the change (e.g., "Corrected grammatical error", "Changed voice to passive").

Original Text:
"${text}"
`;

            setProgress(30, 'Step 1: Replacing synonyms and correcting grammar...');
            const resultJson = await callGeminiAPI(integratedPrompt);
            const result = JSON.parse(resultJson);

            setProgress(70, 'Step 2: Applying structural transformations...');

            textInput.style.zIndex = -1;
            processedText.style.zIndex = 1;

            renderOutput(result.final_text, result.changes);

            addHistoryItem(text, result.final_text, result.changes);

            setProgress(100, 'Done!');
            hideProgressBar();

        } catch (error) {
            alert(`An error occurred: ${error.message}`);
            console.error(error); // Log the full error for debugging
            hideProgressBar();
        }
    });

    function renderOutput(finalText, changes) {
        // Display the full final text in the main area
        processedText.textContent = finalText;
        suggestionList.innerHTML = ''; // Clear previous suggestions

        if (!changes || changes.length === 0) {
            suggestionList.innerHTML = '<p class="placeholder">No specific changes were made.</p>';
            return;
        }

        // Group changes by step
        const groupedChanges = changes.reduce((acc, change) => {
            const stepKey = change.step && change.step.includes('Step 1') ? 'Step 1' : (change.step && change.step.includes('Step 2') ? 'Step 2' : 'Other Changes');
            if (!acc[stepKey]) {
                acc[stepKey] = [];
            }
            acc[stepKey].push(change);
            return acc;
        }, {});

        // Render changes for each step in order
        ['Step 1', 'Step 2', 'Other Changes'].forEach(stepName => {
            if (groupedChanges[stepName]) {
                const stepHeader = document.createElement('h3');
                stepHeader.className = 'step-header'; // New class for styling
                stepHeader.textContent = stepName === 'Step 1' 
                    ? 'Step 1: Synonym & Grammar' 
                    : (stepName === 'Step 2' ? 'Step 2: Structure' : stepName);
                suggestionList.appendChild(stepHeader);

                groupedChanges[stepName].forEach(change => {
                    const changeCard = document.createElement('div');
                    changeCard.className = 'suggestion-group';

                    const explanationEl = document.createElement('div');
                    explanationEl.className = 'suggestion-explanation';
                    explanationEl.textContent = change.explanation;
                    changeCard.appendChild(explanationEl);

                    const originalEl = document.createElement('div');
                    originalEl.className = 'original-sentence';
                    originalEl.innerHTML = `<strong>Original:</strong> ${change.original}`;
                    changeCard.appendChild(originalEl);

                    const changedEl = document.createElement('div');
                    changedEl.className = 'suggestion-item';
                    changedEl.innerHTML = `<strong>Changed:</strong> ${change.changed}`;
                    changeCard.appendChild(changedEl);

                    suggestionList.appendChild(changeCard);
                });
            }
        });
    }

    async function callGeminiAPI(prompt) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${geminiApiKey}`;
        const requestBody = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { "response_mime_type": "application/json" }
        };
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'API Error');
            }
            const data = await response.json();
            return data.candidates[0]?.content?.parts[0]?.text;
        } catch (error) {
            console.error('Gemini API call failed:', error);
            throw error;
        }
    }

    // --- History, Settings, and other UI logic from previous steps ---
    // (This includes saveHistory, renderHistory, addHistoryItem, loadHistoryItem, clearHistory, loadHistory, openSettingsModal, closeSettingsModal, word counter, progress bar, theme switcher, model selection, layout mode, API key loading)

    // --- Initialization ---
    loadApiKey();
    loadTheme();
    loadHistory();
    loadLayoutMode();
    loadModel();
    textInput.style.zIndex = 1;
    processedText.style.zIndex = -1;

    // Helper functions for UI that are not directly in the main flow
    function showProgressBar() { progressContainer.classList.remove('hidden'); }
    function hideProgressBar(delay = 500) { setTimeout(() => { progressContainer.classList.add('hidden'); }, delay); }
    function setProgress(percentage, message = '') { progressBar.style.width = `${percentage}%`; if (message) progressMessage.textContent = message; }
    function openSettingsModal() { settingsModal.classList.remove('hidden'); }
    function closeSettingsModal() { settingsModal.classList.add('hidden'); }
    function loadApiKey() { const savedKey = localStorage.getItem('geminiApiKey'); if (savedKey) { geminiApiKey = savedKey; apiKeyInput.value = savedKey; } else { openSettingsModal(); } }
    function loadTheme() { const savedTheme = localStorage.getItem('theme') || 'light'; applyTheme(savedTheme); themePreviewButtons.forEach(button => { button.classList.toggle('selected', button.dataset.theme === savedTheme); }); }
    function applyTheme(themeName) { document.body.className = ''; if (themeName !== 'light') { document.body.classList.add(`${themeName}-theme`); } }
    function loadModel() { const savedModel = localStorage.getItem('ai_humanizer_selected_model') || 'gemini-2.5-flash-lite'; selectedModel = savedModel; modelSelectButtons.forEach(button => { button.classList.toggle('selected', button.dataset.model === savedModel); }); }
    function loadLayoutMode() { const savedLayout = localStorage.getItem('layoutMode') === 'true'; applyLayoutMode(savedLayout); }
    function applyLayoutMode(isVertical) { document.body.classList.toggle('vertical-layout', isVertical); layoutModeToggle.checked = isVertical; }
    function saveHistory() { localStorage.setItem('aiHumanizerHistory', JSON.stringify(history)); }
    function loadHistory() { history = JSON.parse(localStorage.getItem('aiHumanizerHistory') || '[]'); renderHistory(); }
    function clearHistory() { if (confirm('Are you sure you want to clear all history?')) { history = []; activeHistoryId = null; textInput.value = ''; processedText.innerHTML = ''; suggestionList.innerHTML = '<p class="placeholder">Process text to see suggestions.</p>'; saveHistory(); renderHistory(); } }
    function addHistoryItem(text, processedText, changes) { if (!text || !text.trim()) return; const newItem = { id: Date.now(), text, processedText, changes }; history.unshift(newItem); if (history.length > 100) { history.pop(); } activeHistoryId = newItem.id; saveHistory(); renderHistory(); }
    function renderHistory() { historyList.innerHTML = ''; if (history.length === 0) { historyList.innerHTML = '<p class="placeholder">Your history will appear here.</p>'; return; } history.forEach(item => { const historyItem = document.createElement('div'); historyItem.className = 'history-item'; historyItem.dataset.id = item.id; if (item.id === activeHistoryId) { historyItem.classList.add('active'); } historyItem.textContent = item.text.substring(0, 50) + (item.text.length > 50 ? '...' : ''); historyItem.addEventListener('click', () => loadHistoryItem(item.id)); historyList.appendChild(historyItem); }); }
    function loadHistoryItem(id) { const item = history.find(h => h.id === id); if (item) { textInput.value = item.text; renderOutput(item.processedText, item.changes); activeHistoryId = id; renderHistory(); textInput.dispatchEvent(new Event('input', { bubbles: true })); textInput.style.zIndex = -1; processedText.style.zIndex = 1; } }

    textInput.addEventListener('input', () => { const text = textInput.value; const wordCount = text.trim().split(/\s+/).filter(Boolean).length; wordCounter.textContent = `${wordCount} words`; });
    clearHistoryButton.addEventListener('click', clearHistory);
    settingsButton.addEventListener('click', openSettingsModal);
    closeSettingsModalButton.addEventListener('click', closeSettingsModal);
    settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeSettingsModal(); });
    saveApiKeyButton.addEventListener('click', () => { const key = apiKeyInput.value.trim(); if (key) { localStorage.setItem('geminiApiKey', key); geminiApiKey = key; alert('Gemini API Key saved!'); closeSettingsModal(); } else { alert('Please enter a valid API key.'); } });
    themePreviewButtons.forEach(button => { button.addEventListener('click', (e) => { const selectedTheme = e.currentTarget.dataset.theme; applyTheme(selectedTheme); localStorage.setItem('theme', selectedTheme); themePreviewButtons.forEach(btn => btn.classList.remove('selected')); e.currentTarget.classList.add('selected'); }); });
    modelSelectButtons.forEach(button => { button.addEventListener('click', (e) => { const newModel = e.currentTarget.dataset.model; selectedModel = newModel; localStorage.setItem('ai_humanizer_selected_model', newModel); modelSelectButtons.forEach(btn => btn.classList.remove('selected')); e.currentTarget.classList.add('selected'); }); });
    layoutModeToggle.addEventListener('change', (e) => { const isVertical = e.target.checked; localStorage.setItem('layoutMode', isVertical); applyLayoutMode(isVertical); });
});