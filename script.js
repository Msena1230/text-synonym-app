import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // --- Helper to disable transitions during content swap ---
    const style = document.createElement('style');
    style.textContent = '.no-transition { transition: none !important; }\n' +
    '.skeleton-card { background-color: #e0e0e0; border-radius: 8px; padding: 15px; margin-bottom: 15px; position: relative; overflow: hidden; }\n' +
    '.skeleton-title { height: 20px; width: 60%; background-color: #c7c7c7; border-radius: 4px; margin-bottom: 10px; }\n' +
    '.skeleton-text { height: 15px; width: 90%; background-color: #c7c7c7; border-radius: 4px; margin-bottom: 8px; }\n' +
    '.skeleton-text.short { width: 40%; }\n' +
    '.shimmer::after { content: \'\'; position: absolute; top: 0; left: -150%; width: 150%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); animation: shimmer-animation 1.5s infinite; }\n' +
    '@keyframes shimmer-animation { 100% { left: 150%; } }\n' +
    '/* Solarized Dark Theme */\n' +
    '.solarized-dark-preview { background-color: #002b36; border: 1px solid #586e75; }\n' +
    '.solarized-dark-theme { --bg-color: #002b36; --text-color: #839496; --panel-bg-color: #073642; --border-color: #586e75; --header-text-color: #93a1a1; --button-text-color: #fdf6e3; --secondary-button-bg-color: #586e75; --secondary-button-text-color: #fdf6e3; --highlight-color: #2aa198; --modified-color: #b58900; --placeholder-color: #586e75; background-color: var(--bg-color); color: var(--text-color); }\n' +
    '.solarized-dark-theme .panel { background-color: var(--panel-bg-color); border: 1px solid var(--border-color); }\n' +
    '.solarized-dark-theme h2, .solarized-dark-theme h3, .solarized-dark-theme h4 { color: var(--header-text-color); }\n' +
    '.solarized-dark-theme button, .solarized-dark-theme .save-button { background-color: var(--accent-color); color: var(--button-text-color); border: none; }\n' +
    '.solarized-dark-theme button:hover { filter: brightness(1.2); }\n' +
    '.solarized-dark-theme .secondary-button { background-color: var(--secondary-button-bg-color); color: var(--secondary-button-text-color); }\n' +
    '.solarized-dark-theme .model-select-button.selected { background-color: var(--accent-color); color: var(--button-text-color); }\n' +
    '.solarized-dark-theme .theme-preview-button.selected { box-shadow: 0 0 0 2px var(--accent-color); }\n' +
    '.solarized-dark-theme .theme-preview-button.selected span { color: var(--header-text-color); }\n' +
    '.solarized-dark-theme .modal-content { background-color: var(--panel-bg-color); color: var(--text-color); }\n' +
    '.solarized-dark-theme textarea, .solarized-dark-theme #processed-text { background-color: var(--bg-color); color: var(--text-color); border: 1px solid var(--border-color); }\n' +
    '.solarized-dark-theme .replaceable { border-bottom: 2px dotted var(--highlight-color); }\n' +
    '.solarized-dark-theme .replaceable.modified { border-bottom: 2px solid var(--modified-color); color: var(--modified-color); }\n' +
    '.solarized-dark-theme .synonym-group { background-color: var(--bg-color); border-bottom: 1px solid var(--border-color); }\n' +
    '.solarized-dark-theme #login-button { background-color: #dc322f; color: #fff; }\n' +

    '/* Solarized Light Theme */\n' +
    '.solarized-light-preview { background-color: #fdf6e3; border: 1px solid #93a1a1; }\n' +
    '.solarized-light-theme { --bg-color: #fdf6e3; --text-color: #657b83; --panel-bg-color: #eee8d5; --border-color: #93a1a1; --header-text-color: #586e75; --button-text-color: #fdf6e3; --secondary-button-bg-color: #eee8d5; --secondary-button-text-color: #657b83; --highlight-color: #2aa198; --modified-color: #b58900; --placeholder-color: #93a1a1; background-color: var(--bg-color); color: var(--text-color); }\n' +
    '.solarized-light-theme .panel { background-color: var(--panel-bg-color); border: 1px solid var(--border-color); }\n' +
    '.solarized-light-theme h2, .solarized-light-theme h3, .solarized-light-theme h4 { color: var(--header-text-color); }\n' +
    '.solarized-light-theme button, .solarized-light-theme .save-button { background-color: var(--accent-color); color: var(--button-text-color); border: none; }\n' +
    '.solarized-light-theme button:hover { filter: brightness(1.1); }\n' +
    '.solarized-light-theme .secondary-button { background-color: var(--secondary-button-bg-color); color: var(--secondary-button-text-color); border: 1px solid var(--border-color); }\n' +
    '.solarized-light-theme .model-select-button.selected { background-color: var(--accent-color); color: var(--button-text-color); }\n' +
    '.solarized-light-theme .theme-preview-button.selected { box-shadow: 0 0 0 2px var(--accent-color); }\n' +
    '.solarized-light-theme .theme-preview-button.selected span { color: var(--header-text-color); }\n' +
    '.solarized-light-theme .modal-content { background-color: var(--panel-bg-color); color: var(--text-color); }\n' +
    '.solarized-light-theme textarea, .solarized-light-theme #processed-text { background-color: var(--bg-color); color: var(--text-color); border: 1px solid var(--border-color); }\n' +
    '.solarized-light-theme .replaceable { border-bottom: 2px dotted var(--highlight-color); }\n' +
    '.solarized-light-theme .replaceable.modified { border-bottom: 2px solid var(--modified-color); color: var(--modified-color); }\n' +
    '.solarized-light-theme .synonym-group { background-color: var(--bg-color); border-bottom: 1px solid var(--border-color); }\n' +
    '.solarized-light-theme #login-button { background-color: #dc322f; color: #fff; }\n' +

    '/* Gruvbox Theme */\n' +
    '.gruvbox-preview { background-color: #282828; border: 1px solid #928374; }\n' +
    '.gruvbox-theme { --bg-color: #282828; --text-color: #ebdbb2; --panel-bg-color: #3c3836; --border-color: #928374; --header-text-color: #ebdbb2; --button-text-color: #ebdbb2; --secondary-button-bg-color: #504945; --secondary-button-text-color: #ebdbb2; --highlight-color: #83a598; --modified-color: #fabd2f; --placeholder-color: #928374; background-color: var(--bg-color); color: var(--text-color); }\n' +
    '.gruvbox-theme .panel { background-color: var(--panel-bg-color); border: 1px solid var(--border-color); }\n' +
    '.gruvbox-theme h2, .gruvbox-theme h3, .gruvbox-theme h4 { color: var(--header-text-color); }\n' +
    '.gruvbox-theme button, .gruvbox-theme .save-button { background-color: var(--accent-color); color: var(--button-text-color); border: none; }\n' +
    '.gruvbox-theme button:hover { filter: brightness(1.2); }\n' +
    '.gruvbox-theme .secondary-button { background-color: var(--secondary-button-bg-color); color: var(--secondary-button-text-color); }\n' +
    '.gruvbox-theme .model-select-button.selected { background-color: var(--accent-color); color: var(--button-text-color); }\n' +
    '.gruvbox-theme .theme-preview-button.selected { box-shadow: 0 0 0 2px var(--accent-color); }\n' +
    '.gruvbox-theme .theme-preview-button.selected span { color: var(--header-text-color); }\n' +
    '.gruvbox-theme .modal-content { background-color: var(--panel-bg-color); color: var(--text-color); }\n' +
    '.gruvbox-theme textarea, .gruvbox-theme #processed-text { background-color: var(--bg-color); color: var(--text-color); border: 1px solid var(--border-color); }\n' +
    '.gruvbox-theme .replaceable { border-bottom: 2px dotted var(--highlight-color); }\n' +
    '.gruvbox-theme .replaceable.modified { border-bottom: 2px solid var(--modified-color); color: var(--modified-color); }\n' +
    '.gruvbox-theme .synonym-group { background-color: var(--bg-color); border-bottom: 1px solid var(--border-color); }\n' +
    '.gruvbox-theme #login-button { background-color: #D65D0E; color: #fff; }\n' +

    '/* Dracula Theme */\n' +
    '.dracula-preview { background-color: #282a36; border: 1px solid #6272a4; }\n' +
    '.dracula-theme { --bg-color: #282a36; --text-color: #f8f8f2; --panel-bg-color: #44475a; --border-color: #6272a4; --header-text-color: #f8f8f2; --button-text-color: #f8f8f2; --secondary-button-bg-color: #6272a4; --secondary-button-text-color: #f8f8f2; --highlight-color: #50fa7b; --modified-color: #ffb86c; --placeholder-color: #6272a4; background-color: var(--bg-color); color: var(--text-color); }\n' +
    '.dracula-theme .panel { background-color: var(--panel-bg-color); border: 1px solid var(--border-color); }\n' +
    '.dracula-theme h2, .dracula-theme h3, .dracula-theme h4 { color: var(--header-text-color); }\n' +
    '.dracula-theme button, .dracula-theme .save-button { background-color: var(--accent-color); color: var(--button-text-color); border: none; }\n' +
    '.dracula-theme button:hover { filter: brightness(1.2); }\n' +
    '.dracula-theme .secondary-button { background-color: var(--secondary-button-bg-color); color: var(--secondary-button-text-color); }\n' +
    '.dracula-theme .model-select-button.selected { background-color: var(--accent-color); color: var(--button-text-color); }\n' +
    '.dracula-theme .theme-preview-button.selected { box-shadow: 0 0 0 2px var(--accent-color); }\n' +
    '.dracula-theme .theme-preview-button.selected span { color: var(--header-text-color); }\n' +
    '.dracula-theme .modal-content { background-color: var(--panel-bg-color); color: var(--text-color); }\n' +
    '.dracula-theme textarea, .dracula-theme #processed-text { background-color: var(--bg-color); color: var(--text-color); border: 1px solid var(--border-color); }\n' +
    '.dracula-theme .replaceable { border-bottom: 2px dotted var(--highlight-color); }\n' +
    '.dracula-theme .replaceable.modified { border-bottom: 2px solid var(--modified-color); color: var(--modified-color); }\n' +
    '.dracula-theme .synonym-group { background-color: var(--bg-color); border-bottom: 1px solid var(--border-color); }\n' +
    '.dracula-theme #login-button { background-color: #ff79c6; color: #fff; }\n';
    document.head.append(style);


    // --- Splash Screen Logic ---
    const splashScreen = document.getElementById('splash-screen');
    const line1 = document.getElementById('splash-text-line1');
    const line2 = document.getElementById('splash-text-line2');
    line1.textContent = line1.dataset.text;
    line2.textContent = line2.dataset.text;
    setTimeout(() => { line1.classList.add('active'); }, 200);
    setTimeout(() => { line2.classList.add('active'); }, 1700);
    setTimeout(() => { splashScreen.classList.add('hidden'); }, 3200);

    const stopWords = new Set([
        'a', 'an', 'the', 'in', 'on', 'at', 'for', 'to', 'of',
        'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
        'my', 'your', 'his', 'its', 'our', 'their',
        'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
        'and', 'but', 'or', 'so', 'if', 'because', 'as', 'while', 'with', 'by', 'from',
        'not', 'no', 'up', 'out', 'then', 'what', 'when', 'where', 'who', 'which', 'how', 'why',
        'this', 'that', 'these', 'those', 'here', 'there'
    ]);

    // --- DOM Elements ---
    const textInput = document.getElementById('text-input');
    const processButton = document.getElementById('process-button');
    const processedText = document.getElementById('processed-text');
    const synonymList = document.getElementById('synonym-list');
    const wordCounter = document.getElementById('word-counter');
    const clearTextButton = document.getElementById('clear-text-button');
    const copyOutputButton = document.getElementById('copy-output-button');
    const aiDetectButton = document.getElementById('ai-detect-button');
    const viewDropdownContainer = document.querySelector('.view-dropdown-container');
    const viewDropdownButton = document.getElementById('view-dropdown-button');
    const viewDropdownMenu = document.getElementById('view-dropdown-menu');
    const viewOriginalItem = document.getElementById('view-original-item');
    const viewLastSavedItem = document.getElementById('view-last-saved-item');
    const viewOverwriteItem = document.getElementById('view-overwrite-item');

    const historyPanel = document.getElementById('history-panel');
    const clearHistoryButton = document.getElementById('clear-history-button');
    const historyList = document.getElementById('history-list');

    const startFlashcardsButton = document.getElementById('start-flashcards-button');
    const bookmarkList = document.getElementById('bookmark-list');
    const favoriteList = document.getElementById('favorite-list');
    const startFavoriteFlashcardsButton = document.getElementById('start-favorite-flashcards-button');

    const settingsModal = document.getElementById('settings-modal');
    const settingsButton = document.getElementById('settings-button');
    const closeSettingsModalButton = document.getElementById('close-settings-modal');

    const bookmarkModal = document.getElementById('bookmark-modal');
    const bookmarkListButton = document.getElementById('bookmark-list-button');
    const closeBookmarkModalButton = document.getElementById('close-bookmark-modal');

    const favoriteModal = document.getElementById('favorite-modal');
    const favoriteListButton = document.getElementById('favorite-list-button');
    const closeFavoriteModalButton = document.getElementById('close-favorite-modal');

    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiKeyButton = document.getElementById('save-api-key');
    const saplingApiKeyInput = document.getElementById('sapling-api-key-input');
    const saveSaplingApiKeyButton = document.getElementById('save-sapling-api-key');
    const saveSaplingApiKeyFeedback = document.getElementById('save-sapling-api-key-feedback');

    const translationLanguageSelect = document.getElementById('translation-language-select');
    const typingSoundSelect = document.getElementById('typing-sound-select');
    const layoutModeToggle = document.getElementById('layout-mode-toggle');

    const modelSelectButtons = document.querySelectorAll('.model-select-button');
    const themePreviewButtons = document.querySelectorAll('.theme-preview-button');
    const accentColorButtons = document.querySelectorAll('.accent-color-button');

    // --- Search Inputs ---
    const historySearchInput = document.getElementById('history-search');
    const bookmarkSearchInput = document.getElementById('bookmark-search');
    const favoriteSearchInput = document.getElementById('favorite-search');

    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressMessage = document.getElementById('progress-message');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const userProfile = document.getElementById('user-profile');
    const guestView = document.getElementById('guest-view');
    const userName = document.getElementById('user-name');
    const notificationModal = document.getElementById('notification-modal');
    const notificationTitle = document.getElementById('notification-title');
    const notificationMessage = document.getElementById('notification-message');
    const notificationCloseButton = document.getElementById('notification-close-button');
    const reciprocalPromptButton = document.getElementById('reciprocal-prompt-button');
    const reciprocalPromptModal = document.getElementById('reciprocal-prompt-modal');
    const closeReciprocalPromptModalButton = document.getElementById('close-reciprocal-prompt-modal');
    const reciprocalPromptOutput = document.getElementById('reciprocal-prompt-output');
    const reciprocalPromptOkButton = document.getElementById('reciprocal-prompt-ok-button');


    // Pro-feature unlock elements
    const proFeatureSection = document.getElementById('pro-feature-section');
    const promoCodeContainer = document.getElementById('promo-code-container');
    const promoCodeInput = document.getElementById('promo-code-input');
    const applyPromoCodeButton = document.getElementById('apply-promo-code-button');
    const promoCodeFeedback = document.getElementById('promo-code-feedback');
    const humanizerUnlockedView = document.getElementById('humanizer-unlocked-view');


    let currentViewMode = 'original'; // 'original' or 'edited'

    const saveCurrentEditedContent = () => {
        if (!activeHistoryId) return;
        const activeItem = history.find(item => item.id === activeHistoryId);
        if (activeItem) {
            activeItem.editedHtmlContent = processedText.innerHTML;
            saveHistory(); // Save to localStorage and Firestore
            console.log(`Edited content auto-saved for item ${activeHistoryId}`);
        }
    };

    const renderOriginalView = () => {
        if (!activeHistoryId) return;
        const activeItem = history.find(item => item.id === activeHistoryId);
        if (activeItem && activeItem.synonymData && activeItem.parts) {
            renderSynonymCandidates(activeItem.synonymData, activeItem.parts);
        }
        else {
            processedText.innerHTML = '';
            synonymList.innerHTML = '<p class="placeholder">No synonym data saved. Process again.</p>';
        }
        currentViewMode = 'original';
        updateViewButtonText();
    };

    const updateViewButtonText = () => {
        if (viewDropdownButton) {
            const textSpan = viewDropdownButton.querySelector('span');
            if (currentViewMode === 'original') {
                textSpan.textContent = 'Original';
            } else {
                textSpan.textContent = 'Edited';
            }
            // Add 'selected' class for styling if needed
            viewDropdownButton.classList.toggle('selected', currentViewMode === 'edited');
        }
    };

    if (viewDropdownButton) {
        viewDropdownButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent document click from immediately closing
            viewDropdownMenu.classList.toggle('hidden');
            viewDropdownContainer.classList.toggle('active');
        });
    }

    if (viewOriginalItem) {
        viewOriginalItem.addEventListener('click', (e) => {
            e.preventDefault();
            renderOriginalView();
            viewDropdownMenu.classList.add('hidden');
            viewDropdownContainer.classList.remove('active');
        });
    }

    if (viewLastSavedItem) {
        viewLastSavedItem.addEventListener('click', (e) => {
            e.preventDefault();
            if (!activeHistoryId) return;
            const activeItem = history.find(item => item.id === activeHistoryId);
            if (activeItem && activeItem.editedHtmlContent) {
                processedText.innerHTML = activeItem.editedHtmlContent;
                currentViewMode = 'edited';
                updateViewButtonText();
            } else {
                showNotification('No Saved Edits', 'There are no saved edits for this item. Showing original view.');
                renderOriginalView();
            }
            viewDropdownMenu.classList.add('hidden');
            viewDropdownContainer.classList.remove('active');
        });
    }

    if (viewOverwriteItem) {
        viewOverwriteItem.addEventListener('click', (e) => {
            e.preventDefault();
            saveCurrentEditedContent(); // Overwrite with current processedText content
            currentViewMode = 'edited';
            updateViewButtonText();
            viewDropdownMenu.classList.add('hidden');
            viewDropdownContainer.classList.remove('active');
        });
    }

    // Hide dropdown if clicked outside
    document.addEventListener('click', (e) => {
        if (viewDropdownMenu && !viewDropdownMenu.contains(e.target) &&
            viewDropdownButton && !viewDropdownButton.contains(e.target)) {
            viewDropdownMenu.classList.add('hidden');
            viewDropdownContainer.classList.remove('active');
        }
    });

    // --- Plain Text Paste Logic ---
    const handlePaste = (e) => {
        // Stop the default paste action, which might include rich text
        e.preventDefault();

        // Get the pasted data as plain text
        const text = (e.clipboardData || window.clipboardData).getData('text/plain');

        // Insert the plain text into the document. This works for both textarea and contenteditable divs.
        document.execCommand('insertText', false, text);
        
        // For the textarea, we need to manually trigger the 'input' event
        // so that the word counter updates.
        if (e.target.id === 'text-input') {
            e.target.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };

    textInput.addEventListener('paste', handlePaste);
    processedText.addEventListener('paste', handlePaste);

    // --- Event Delegation for replaceable words ---
    processedText.addEventListener('click', (e) => {
        if (e.target && e.target.matches('span.replaceable')) {
            const span = e.target;
            const wordId = span.id;
            const groupId = 'group-' + wordId.split('-')[1];
            const groupElement = document.getElementById(groupId);

            if (groupElement) {
                groupElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                groupElement.classList.add('scrolled-highlight');
                setTimeout(() => groupElement.classList.remove('scrolled-highlight'), 3500);
            }
        }
    });


    let geminiApiKey = '';


    let saplingApiKey = '';
    let history = [];
    let activeHistoryId = null;
    let messageIntervalId = null;
    let progressIntervalId = null;
    let selectedModel = 'gemini-2.5-flash-lite';
    let selectedTranslationLanguage = 'Japanese';
    let selectedAccentColor = '#4a89dc';
    let selectedTypingSound = 'none';


    // --- Typing Sound Assets ---
    const typingSounds = {
        click: new Audio('sounds/click.mp3'),
        typewriter: new Audio('sounds/typewriter.mp3')
    };

    const loadingMessages = [
        'Working on it...', 'Analyzing your text...', 'Asking the AI for suggestions!',
        'Still in progress...', 'Fetching synonyms...', 'Just a moment longer!',
        'Compiling the results...', 'Almost there!'
    ];

    // --- Notification Logic ---
    const showNotification = (title, message) => {
        notificationTitle.textContent = title;
        notificationMessage.textContent = message;
        notificationModal.classList.remove('hidden');
    };

    const closeNotification = () => {
        notificationModal.classList.add('hidden');
    };

    notificationCloseButton.addEventListener('click', closeNotification);
    notificationModal.addEventListener('click', (e) => { 
        if (e.target === notificationModal) closeNotification(); 
    });

    // --- Usage Limit for Guests ---
    const checkUsageLimit = () => {
        if (auth.currentUser) return true;
        const usageData = JSON.parse(localStorage.getItem('guestUsage') || '{}');
        const today = new Date().toISOString().split('T')[0];
        if (usageData.date === today && usageData.count >= 1) {
            showNotification('Daily Limit Reached', 'You have reached the daily limit for guest users. Please sign in for unlimited use.');
            return false;
        }
        return true;
    };

    const recordUsage = () => {
        if (auth.currentUser) return;
        const usageData = JSON.parse(localStorage.getItem('guestUsage') || '{}');
        const today = new Date().toISOString().split('T')[0];
        if (usageData.date === today) {
            usageData.count = (usageData.count || 0) + 1;
        } else {
            usageData.date = today;
            usageData.count = 1;
        }
        localStorage.setItem('guestUsage', JSON.stringify(usageData));
    };

    // --- Firebase Auth & Data Sync Logic ---
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userProfile.classList.remove('hidden');
            guestView.classList.add('hidden');
            userName.textContent = user.displayName;
            if (historyPanel) {
                historyPanel.style.display = 'flex';
            }
            await loadDataFromFirestore(user);
        } else {
            userProfile.classList.add('hidden');
            guestView.classList.remove('hidden');
            userName.textContent = '';
            
            // --- Guest Mode: History Disabled ---
            history = [];
            historyList.innerHTML = '<p class="placeholder">Please log in to use the history feature.</p>';
            if (historyPanel) {
                historyPanel.style.display = 'none';
            }

            const localBookmarks = JSON.parse(localStorage.getItem('bookmarkedWords') || '[]');
            saveBookmarks(localBookmarks, false);

            const localFavorites = JSON.parse(localStorage.getItem('favoritedWords') || '[]');
            saveFavorites(localFavorites, false);
            
            loadTheme();
            loadLayoutMode();
            loadModel();
            loadTranslationLanguage();
            loadSaplingApiKey();
            loadAccentColor();
            loadTypingSound();

            // Reset and hide pro feature for guests
            isPro = false;
            updateHumanizerFeatureUI();
        }
    });

    const loadDataFromFirestore = async (user) => {
        const userDocRef = doc(db, "users", user.uid);
        try {
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                history = data.history || [];
                saveBookmarks(data.bookmarks || [], false);
                saveFavorites(data.favorites || [], false); // Load favorites from Firestore
                const userSettings = data.settings || {};
                applyTheme(userSettings.theme || 'light');
                applyLayoutMode(userSettings.layoutMode || false);
                selectedModel = userSettings.selectedModel || 'gemini-2.5-flash-lite';
                selectedTranslationLanguage = userSettings.translationLanguage || 'Japanese';
                saplingApiKey = userSettings.saplingApiKey || '';
                geminiApiKey = userSettings.geminiApiKey || '';
                selectedAccentColor = userSettings.accentColor || '#4a89dc';
                selectedTypingSound = userSettings.typingSound || 'none';
                isPro = userSettings.isPro || false;

                updateSelectedThemeButton(userSettings.theme || 'light');
                updateSelectedModelButton();
                updateSelectedAccentColorButton();
                if (translationLanguageSelect) {
                    translationLanguageSelect.value = selectedTranslationLanguage;
                }
                if (typingSoundSelect) {
                    typingSoundSelect.value = selectedTypingSound;
                }
                if (saplingApiKeyInput) {
                    saplingApiKeyInput.value = saplingApiKey;
                }
                if (apiKeyInput) {
                    apiKeyInput.value = geminiApiKey;
                }
                applyAccentColor(selectedAccentColor);

                // Sync Firestore settings to localStorage to prevent overwrites
                localStorage.setItem('theme', userSettings.theme || 'light');
                localStorage.setItem('layoutMode', userSettings.layoutMode || false);
                localStorage.setItem('ai_humanizer_selected_model', selectedModel);
                localStorage.setItem('translationLanguage', selectedTranslationLanguage);
                localStorage.setItem('saplingApiKey', saplingApiKey);
                localStorage.setItem('geminiApiKey', geminiApiKey);
                localStorage.setItem('accentColor', selectedAccentColor);
                localStorage.setItem('typingSound', selectedTypingSound);

            } else {
                console.log("Creating new user document in Firestore.");
                isPro = false; // Default for new users
                saveUserData();
            }
            renderHistory();
            updateHumanizerFeatureUI(); // Update UI based on loaded settings
        } catch (error) {
            console.error("Error loading data from Firestore: ", error);
            loadHistory();
            renderBookmarks();
            updateHumanizerFeatureUI(); // Also update UI on error to ensure correct state
        }
    };

    const saveUserData = async () => {
        const user = auth.currentUser;
        if (!user) return;
        const userDocRef = doc(db, "users", user.uid);
        const dataToSave = {
            history: history,
            bookmarks: getBookmarks(),
            favorites: getFavorites(), // Add favorites to user data
            settings: {
                theme: document.body.classList.contains('dark-theme') ? 'dark' : (document.body.classList.contains('nord-theme') ? 'nord' : (document.body.classList.contains('glass-theme') ? 'glass' : 'light')),
                layoutMode: layoutModeToggle.checked,
                selectedModel: selectedModel,
                translationLanguage: selectedTranslationLanguage,
                saplingApiKey: saplingApiKey,
                geminiApiKey: geminiApiKey,
                accentColor: selectedAccentColor,
                typingSound: selectedTypingSound,
                isPro: isPro
            }
        };
        try {
            await setDoc(userDocRef, dataToSave, { merge: true });
            console.log('User data saved to Firestore');
        } catch (error) {
            console.error("Error saving user data to Firestore: ", error);
        }
    };

    loginButton.addEventListener('click', () => {
        const termsAgreeCheckbox = document.getElementById('terms-agree-checkbox');
        if (!termsAgreeCheckbox.checked) {
            showNotification('Agreement Required', 'Please agree to the Terms of Service and Privacy Policy before signing in.');
            return;
        }
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider).catch(error => {
            console.error('Login failed', error);
            alert(`Login failed: ${error.message}`);
        });
    });

    logoutButton.addEventListener('click', () => {
        signOut(auth).catch(error => console.error('Logout failed', error));
    });

    // --- History Logic ---
    const saveHistory = () => {
        if (!auth.currentUser) return;
        localStorage.setItem('synonymFinderHistory', JSON.stringify(history));
        saveUserData();
    };

    const updateVersionDropdown = () => {
        // バージョン管理機能が実装された際にロジックを追加
        console.log('updateVersionDropdown called. (Function not yet implemented)');
    };

    const getHistoryGroup = (timestamp) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const thisWeek = new Date(today);
        thisWeek.setDate(thisWeek.getDate() - now.getDay());
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const date = new Date(timestamp);
        if (date >= today) return 'Today';
        if (date >= yesterday) return 'Yesterday';
        if (date >= thisWeek) return 'This Week';
        if (date >= thisMonth) return 'This Month';
        return 'Older';
    };

    const renderHistory = () => {
        if (!auth.currentUser) {
            // historyList.innerHTML = '<p class="placeholder">Please log in to use the history feature.</p>';
            // return;
        }

        const searchTerm = historySearchInput.value.toLowerCase();
        const filteredHistory = history.filter(item => {
            const title = item.customTitle || item.text;
            return title.toLowerCase().includes(searchTerm);
        });

        historyList.innerHTML = '';
        if (filteredHistory.length === 0) {
            historyList.innerHTML = `<p class="placeholder">No history items match your search.</p>`;
            return;
        }

        const groupedHistory = { Today: [], Yesterday: [], 'This Week': [], 'This Month': [], Older: [] };
        filteredHistory.forEach(item => {
            const group = getHistoryGroup(item.id);
            groupedHistory[group].push(item);
        });
        Object.keys(groupedHistory).forEach(groupName => {
            const groupItems = groupedHistory[groupName];
            if (groupItems.length > 0) {
                const header = document.createElement('h5');
                header.className = 'history-group-header';
                header.textContent = groupName;
                historyList.appendChild(header);
                // As requested by the user, the rendering logic for history items is commented out when not logged in.
                // This logic is now controlled by the `if (!auth.currentUser)` check at the beginning of the function.
                groupItems.forEach(item => {
                    const historyItem = document.createElement('div');
                    historyItem.className = 'history-item';
                    historyItem.dataset.id = item.id;
                    if (item.id === activeHistoryId) {
                        historyItem.classList.add('active');
                    }
                    const textSpan = document.createElement('span');
                    textSpan.className = 'history-item-text';
                    textSpan.textContent = item.customTitle || (item.text.substring(0, 50) + (item.text.length > 50 ? '...' : ''));
                    historyItem.appendChild(textSpan);
                    const buttonsDiv = document.createElement('div');
                    buttonsDiv.className = 'history-item-buttons';
                    const renameBtn = document.createElement('button');
                    renameBtn.className = 'rename-history-item-btn';
                    renameBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
                    renameBtn.title = 'Rename this item';
                    renameBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        startRename(historyItem, item.id);
                    });
                    buttonsDiv.appendChild(renameBtn);
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-history-item-btn';
                    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
                    deleteBtn.title = 'Delete this item';
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this item?')) {
                            deleteHistoryItem(item.id);
                        }
                    });
                    buttonsDiv.appendChild(deleteBtn);
                    historyItem.appendChild(buttonsDiv);
                    historyItem.addEventListener('click', () => {
                        if (historyItem.querySelector('input')) return;
                        loadHistoryItem(item.id);
                    });
                    historyList.appendChild(historyItem);
                });
            }
        });
    };

    const startRename = (historyItem, itemId) => {
        const textSpan = historyItem.querySelector('.history-item-text');
        const currentTitle = textSpan.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'history-item-input';
        input.value = currentTitle;
        const save = () => {
            const newTitle = input.value.trim();
            if (newTitle && newTitle !== currentTitle) {
                saveNewTitle(itemId, newTitle);
            } else {
                renderHistory();
            }
        };
        input.addEventListener('blur', save);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            } else if (e.key === 'Escape') {
                renderHistory();
            }
        });
        historyItem.replaceChild(input, textSpan);
        input.focus();
        input.select();
    };

    const saveNewTitle = (itemId, newTitle) => {
        const itemIndex = history.findIndex(item => item.id === itemId);
        if (itemIndex > -1) {
            history[itemIndex].customTitle = newTitle;
            saveHistory();
            renderHistory();
        }
    };

    const addHistoryItem = (text, parts, synonymData) => {
        if (!auth.currentUser) return;
        if (!text || !text.trim()) return;
        const newItem = { id: Date.now(), text, parts, synonymData, versions: [] };
        const existingIndex = history.findIndex(item => item.text === text);
        if (existingIndex > -1) {
            history.splice(existingIndex, 1);
        }
        history.unshift(newItem);
        activeHistoryId = newItem.id;
        if (history.length > 100) {
            history = history.slice(0, 100);
        }
        saveHistory();
        renderHistory();
        updateVersionDropdown();
    };

    const loadHistoryItem = (id, versionId = undefined) => {
        const item = history.find(h => h.id === id);
        if (item) {
            textInput.value = item.text;
            activeHistoryId = id;

            // Determine which version to load
            let versionToLoad = null;
            if (versionId) {
                versionToLoad = item.versions.find(v => v.versionId === versionId);
            } else if (item.versions && item.versions.length > 0) {
                versionToLoad = item.versions[item.versions.length - 1]; // Default to latest
            }

            // Render text and synonyms
            // Prioritize showing the last saved edited content if it exists.
            if (item.editedHtmlContent) {
                processedText.innerHTML = DOMPurify.sanitize(item.editedHtmlContent);
                currentViewMode = 'edited';
                updateViewButtonText();
                // We still need the synonym list to be populated for context.
                if (item.synonymData && item.parts) {
                    renderSynonymList(item.synonymData, item.parts);
                } else {
                    synonymList.innerHTML = '<p class="placeholder">No synonym data available.</p>';
                }
            } else if (versionToLoad) {
                if (item.synonymData && item.parts) {
                    renderSynonymCandidates(item.synonymData, item.parts);
                } else {
                    processedText.innerHTML = DOMPurify.sanitize(versionToLoad.htmlContent); // synonymDataがない場合は元のHTMLを表示
                }
            } else if (item.synonymData && item.parts) {
                renderSynonymCandidates(item.synonymData, item.parts);
            } else {
                processedText.innerHTML = '';
                synonymList.innerHTML = '<p class="placeholder">No synonym data saved. Process again.</p>';
            }

            textInput.style.zIndex = -1;
            processedText.style.zIndex = 1;
            renderHistory();
            textInput.dispatchEvent(new Event('input', { bubbles: true }));
            updateVersionDropdown();
        }
    };

    const deleteHistoryItem = (id) => {
        history = history.filter(item => item.id !== id);
        if (activeHistoryId === id) {
            activeHistoryId = null;
            textInput.value = '';
            processedText.innerHTML = '';
        }
        saveHistory();
        renderHistory();
        updateVersionDropdown();
    };

    const clearHistory = () => {
        if (confirm('Are you sure you want to clear all history?')) {
            history = [];
            activeHistoryId = null;
            textInput.value = '';
            processedText.innerHTML = '';
            saveHistory();
            renderHistory();
            updateVersionDropdown();
        }
    };

    const loadHistory = () => {
        history = JSON.parse(localStorage.getItem('synonymFinderHistory') || '[]');
        renderHistory();
    };

    clearHistoryButton.addEventListener('click', clearHistory);

    // --- Bookmarks & Flashcards Logic ---
    const getBookmarks = () => JSON.parse(localStorage.getItem('bookmarkedWords') || '[]');

    const saveBookmarks = (bookmarks, doSaveUser = true) => {
        localStorage.setItem('bookmarkedWords', JSON.stringify(bookmarks));
        startFlashcardsButton.style.display = bookmarks.length > 0 ? 'block' : 'none';
        renderBookmarks();
        if(doSaveUser) saveUserData();
    };

    function renderBookmarks() {
        const bookmarks = getBookmarks();
        const searchTerm = bookmarkSearchInput.value.toLowerCase();

        const filteredBookmarks = bookmarks.filter(bookmark => {
            const word = bookmark.originalWord.toLowerCase();
            const meaning = (bookmark.meaning || bookmark.translation || '').toLowerCase();
            const context = (bookmark.context_phrase || '').toLowerCase();
            return word.includes(searchTerm) || meaning.includes(searchTerm) || context.includes(searchTerm);
        });

        bookmarkList.innerHTML = '';
        if (filteredBookmarks.length === 0) {
            bookmarkList.innerHTML = '<p class="placeholder">No bookmarked words match your search.</p>';
            startFlashcardsButton.style.display = 'none';
            return;
        }
        startFlashcardsButton.style.display = 'block';
        filteredBookmarks.forEach(bookmark => {
            const item = document.createElement('div');
            item.className = 'bookmark-item';
            const synonymsHTML = bookmark.synonyms.map(s => `<li>${s.word} <span class="translation">(${s.translation})</span></li>`).join('');
            item.innerHTML = DOMPurify.sanitize(`
                <div class="bookmark-item-content">
                    <div class="original">${bookmark.originalWord} <span class="pos">(${bookmark.pos})</span><span class="translation">(${bookmark.meaning || bookmark.translation || ''})</span></div>
                    <p class="item-context">...${bookmark.context_phrase}...</p>
                    <ul class="bookmark-synonyms">${synonymsHTML}</ul>
                </div>
                <button class="remove-bookmark-btn" data-word="${bookmark.originalWord}" data-context="${bookmark.context_phrase}"><i class="fas fa-trash-alt"></i></button>
            `);
            bookmarkList.appendChild(item);
        });
        document.querySelectorAll('.remove-bookmark-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const wordToRemove = e.currentTarget.dataset.word;
                const contextToRemove = e.currentTarget.dataset.context;
                let currentBookmarks = getBookmarks();
                currentBookmarks = currentBookmarks.filter(b => !(b.originalWord === wordToRemove && b.context_phrase === contextToRemove));
                saveBookmarks(currentBookmarks);
            });
        });
    }

    // --- Favorites Logic ---
    const getFavorites = () => JSON.parse(localStorage.getItem('favoritedWords') || '[]');

    const saveFavorites = (favorites, doSaveUser = true) => {
        localStorage.setItem('favoritedWords', JSON.stringify(favorites));
        startFavoriteFlashcardsButton.style.display = favorites.length > 0 ? 'block' : 'none';
        renderFavorites();
        if(doSaveUser) saveUserData();
    };

    function renderFavorites() {
        const favorites = getFavorites();
        const searchTerm = favoriteSearchInput.value.toLowerCase();

        const filteredFavorites = favorites.filter(favorite => {
            const word = favorite.originalWord.toLowerCase();
            const meaning = (favorite.meaning || favorite.translation || '').toLowerCase();
            const context = (favorite.context_phrase || '').toLowerCase();
            return word.includes(searchTerm) || meaning.includes(searchTerm) || context.includes(searchTerm);
        });

        favoriteList.innerHTML = '';
        if (filteredFavorites.length === 0) {
            favoriteList.innerHTML = '<p class="placeholder">No favorited words match your search.</p>';
            startFavoriteFlashcardsButton.style.display = 'none';
            return;
        }
        startFavoriteFlashcardsButton.style.display = 'block';
        filteredFavorites.forEach(favorite => {
            const item = document.createElement('div');
            item.className = 'bookmark-item'; // Using same style as bookmarks
            const synonymsHTML = favorite.synonyms.map(s => `<li>${s.word} <span class="translation">(${s.translation})</span></li>`).join('');
            item.innerHTML = DOMPurify.sanitize(`
                <div class="bookmark-item-content">
                    <div class="original">${favorite.originalWord} <span class="pos">(${favorite.pos})</span><span class="translation">(${favorite.meaning || favorite.translation || ''})</span></div>
                    <p class="item-context">...${favorite.context_phrase}...</p>
                    <ul class="bookmark-synonyms">${synonymsHTML}</ul>
                </div>
                <button class="remove-bookmark-btn" data-word="${favorite.originalWord}" data-context="${favorite.context_phrase}"><i class="fas fa-trash-alt"></i></button>
            `);
            favoriteList.appendChild(item);
        });
        // Note: We use a more specific selector to avoid conflicts with the bookmark list handler
        favoriteList.querySelectorAll('.remove-bookmark-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const wordToRemove = e.currentTarget.dataset.word;
                const contextToRemove = e.currentTarget.dataset.context;
                let currentFavorites = getFavorites();
                currentFavorites = currentFavorites.filter(f => !(f.originalWord === wordToRemove && f.context_phrase === contextToRemove));
                saveFavorites(currentFavorites);
            });
        });
    }

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const flashcardModal = document.getElementById('flashcard-modal');
    const closeFlashcardModalButton = document.getElementById('close-flashcard-modal');
    const flashcard = document.getElementById('flashcard');
    const flashcardFront = document.querySelector('.flashcard-front');
    const flashcardBack = document.querySelector('.flashcard-back');
    const prevFlashcardButton = document.getElementById('prev-flashcard-button');
    const nextFlashcardButton = document.getElementById('next-flashcard-button');
    const completeFlashcardButton = document.getElementById('complete-flashcard-button');
    const flashcardProgress = document.getElementById('flashcard-progress');
    let flashcardQuiz = [];
    let touchStartX = 0;

    flashcard.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    flashcard.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const swipeThreshold = 50; // Minimum distance for a swipe
        if (touchStartX - touchEndX > swipeThreshold) {
            // Swiped left
            nextFlashcardButton.click();
        } else if (touchEndX - touchStartX > swipeThreshold) {
            // Swiped right
            prevFlashcardButton.click();
        }
    });


    let currentFlashcardIndex = 0;
    let currentFlashcardSource = null; // 'bookmarks' or 'favorites'

    const openFlashcardModal = (wordSource) => {
        currentFlashcardSource = wordSource;
        const words = (wordSource === 'bookmarks') ? getBookmarks() : getFavorites();

        if (words.length === 0) {
            alert(`You have no words in your ${wordSource} to quiz!`);
            return;
        }
        flashcardQuiz = shuffleArray([...words]);
        currentFlashcardIndex = 0;
        renderCurrentFlashcard();
        
        if (wordSource === 'bookmarks') {
            closeBookmarkModal();
        } else {
            closeFavoriteModal();
        }
        flashcardModal.classList.remove('hidden');
    };

    const closeFlashcardModal = () => {
        flashcardModal.classList.add('hidden');
        flashcardQuiz = [];
    };

    const renderCurrentFlashcard = () => {
        if (currentFlashcardIndex >= flashcardQuiz.length) {
            alert('Quiz complete! Well done!');
            closeFlashcardModal();
            return;
        }
        const cardData = flashcardQuiz[currentFlashcardIndex];
        flashcard.classList.remove('is-flipped');
        flashcardFront.textContent = cardData.originalWord;
        const synonymsHTML = cardData.synonyms.map(s => `<li>${s.word} <span class="translation">(${s.translation})</span></li>`).join('');
        flashcardBack.innerHTML = DOMPurify.sanitize(`
            <div class="flashcard-back-content">
                <div class="original">${cardData.originalWord} <span class="pos">(${cardData.pos})</span><span class="translation">(${cardData.meaning || cardData.translation || ''})</span></div>
                <p class="item-context">...${cardData.context_phrase}...</p>
                <ul class="bookmark-synonyms">${synonymsHTML}</ul>
            </div>
        `);
        flashcardProgress.textContent = `${currentFlashcardIndex + 1} / ${flashcardQuiz.length}`;
    };

    const deleteCurrentFlashcardAndAdvance = () => {
        if (flashcardQuiz.length === 0) return;
        const wordToDelete = flashcardQuiz[currentFlashcardIndex].originalWord;
        const contextToDelete = flashcardQuiz[currentFlashcardIndex].context_phrase;
        
        let currentWords = (currentFlashcardSource === 'bookmarks') ? getBookmarks() : getFavorites();
        currentWords = currentWords.filter(b => !(b.originalWord === wordToDelete && b.context_phrase === contextToDelete));
        
        if (currentFlashcardSource === 'bookmarks') {
            saveBookmarks(currentWords);
        } else {
            saveFavorites(currentWords);
        }

        flashcardQuiz.splice(currentFlashcardIndex, 1);
        if (currentFlashcardIndex >= flashcardQuiz.length) {
            currentFlashcardIndex = flashcardQuiz.length - 1;
        }
        if (flashcardQuiz.length === 0) {
            alert('Quiz complete! Well done!');
            closeFlashcardModal();
            // No need to call renderBookmarks/renderFavorites here as they are called by saveBookmarks/saveFavorites
            return;
        }
        renderCurrentFlashcard();
    };

    startFlashcardsButton.addEventListener('click', () => openFlashcardModal('bookmarks'));
    startFavoriteFlashcardsButton.addEventListener('click', () => openFlashcardModal('favorites'));

    closeFlashcardModalButton.addEventListener('click', closeFlashcardModal);
    flashcard.addEventListener('click', () => flashcard.classList.toggle('is-flipped'));
    nextFlashcardButton.addEventListener('click', () => {
        if (currentFlashcardIndex < flashcardQuiz.length - 1) {
            flashcard.classList.add('no-transition');
            flashcard.classList.remove('is-flipped');
            // Force reflow
            void flashcard.offsetHeight;

            currentFlashcardIndex++;
            renderCurrentFlashcard();
            flashcard.classList.remove('no-transition');
        }
    });
    prevFlashcardButton.addEventListener('click', () => {
        if (currentFlashcardIndex > 0) {
            flashcard.classList.add('no-transition');
            flashcard.classList.remove('is-flipped');
            // Force reflow
            void flashcard.offsetHeight;

            currentFlashcardIndex--;
            renderCurrentFlashcard();
            flashcard.classList.remove('no-transition');
        }
    });
    completeFlashcardButton.addEventListener('click', deleteCurrentFlashcardAndAdvance);
    document.addEventListener('keydown', (e) => {
        if (flashcardModal.classList.contains('hidden')) return;
        switch (e.key) {
            case 'ArrowRight': e.preventDefault(); nextFlashcardButton.click(); break;
            case 'ArrowLeft': e.preventDefault(); prevFlashcardButton.click(); break;
            case ' ': case 'ArrowUp': case 'ArrowDown':
                e.preventDefault();
                flashcard.click();
                break;
        }
    });

    // --- Modal Logic ---

    // --- Modal Logic ---
    const openSettingsModal = () => settingsModal.classList.remove('hidden');
    const closeSettingsModal = () => {
        settingsModal.classList.add('hidden');
    };
    const openBookmarkModal = () => { renderBookmarks(); bookmarkModal.classList.remove('hidden'); };
    const closeBookmarkModal = () => bookmarkModal.classList.add('hidden');
    const openFavoriteModal = () => { renderFavorites(); favoriteModal.classList.remove('hidden'); };
    const closeFavoriteModal = () => favoriteModal.classList.add('hidden');

    settingsButton.addEventListener('click', openSettingsModal);
    closeSettingsModalButton.addEventListener('click', closeSettingsModal);
    settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeSettingsModal(); });
    bookmarkListButton.addEventListener('click', openBookmarkModal);
    closeBookmarkModalButton.addEventListener('click', closeBookmarkModal);
    bookmarkModal.addEventListener('click', (e) => { if (e.target === bookmarkModal) closeBookmarkModal(); });
    favoriteListButton.addEventListener('click', openFavoriteModal);
    closeFavoriteModalButton.addEventListener('click', closeFavoriteModal);
    favoriteModal.addEventListener('click', (e) => { if (e.target === favoriteModal) closeFavoriteModal(); });

    // --- Search Event Listeners ---
    historySearchInput.addEventListener('input', renderHistory);
    bookmarkSearchInput.addEventListener('input', renderBookmarks);
    favoriteSearchInput.addEventListener('input', renderFavorites);

    // --- Word Counter & Clear ---
    textInput.addEventListener('input', () => {
        const wordCount = textInput.value.trim().split(/\s+/).filter(Boolean).length;
        wordCounter.textContent = `${wordCount} words`;
    });

    textInput.addEventListener('keydown', () => {
        if (selectedTypingSound !== 'none' && typingSounds[selectedTypingSound]) {
            const sound = typingSounds[selectedTypingSound];
            sound.currentTime = 0; // Allow for rapid key presses
            sound.play().catch(error => console.error("Typing sound playback error:", error));
        }
    });

    textInput.addEventListener('keydown', () => {
        if (selectedTypingSound !== 'none' && typingSounds[selectedTypingSound]) {
            const sound = typingSounds[selectedTypingSound];
            sound.currentTime = 0; // Allow for rapid key presses
            sound.play().catch(error => console.error("Typing sound playback error:", error));
        }
    });


    clearTextButton.addEventListener('click', () => {
        textInput.value = '';
        processedText.innerHTML = '';
        synonymList.innerHTML = '<p class="placeholder">Enter text to see synonyms.</p>';
        textInput.dispatchEvent(new Event('input', { bubbles: true }));
        textInput.style.zIndex = 1;
        processedText.style.zIndex = -1;
    });

    copyOutputButton.addEventListener('click', () => {
        const textToCopy = processedText.innerText;
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = copyOutputButton.textContent;
                copyOutputButton.textContent = 'Copied!';
                copyOutputButton.disabled = true;
                setTimeout(() => {
                    copyOutputButton.textContent = originalText;
                    copyOutputButton.disabled = false;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                alert('Failed to copy text.');
            });
        }
    });

    aiDetectButton.addEventListener('click', async () => {
        if (!saplingApiKey) {
            alert('Please set your Sapling AI Detector API key in the settings first.');
            openSettingsModal();
            return;
        }

        const isOutputPopulated = processedText.innerText.trim().length > 0;
        const textToAnalyze = isOutputPopulated ? processedText.innerText.trim() : textInput.value.trim();

        if (!textToAnalyze) {
            showNotification('AI Detect', 'No text to analyze. Please enter text in the input field.');
            return;
        }

        // Store original content only if we are analyzing the output panel
        const originalProcessedTextContent = isOutputPopulated ? processedText.innerHTML : '';

        showProgressBar();
        setProgress(10, 'Analyzing text for AI content...');
        startMessageInterval(30); // Estimate 30 seconds for AI detection

        const aiDetectResult = await detectAiContent(textToAnalyze);
        stopAllIntervals();
        hideProgressBar();

        if (aiDetectResult.status === 'error') {
            showNotification('AI Detection Error', aiDetectResult.message);
            return;
        }

        const score = aiDetectResult.data.score; // 0 = human, 1 = AI
        const scorePercentage = (score * 100).toFixed(2);
        const scoreStringHtml = aiDetectResult.data.score_string;

        if (scoreStringHtml) {
            // If we analyzed the input text, we need to switch the view to the processedText panel
            if (!isOutputPopulated) {
                textInput.style.zIndex = -1;
                processedText.style.zIndex = 1;
            }

            // Display highlighted text for 10 seconds
            processedText.innerHTML = DOMPurify.sanitize(scoreStringHtml);
            showNotification('AI Detection Result', `AI Detection Score: ${scorePercentage}% AI-generated.\nHighlighted parts indicate AI-generated content.`);

            setTimeout(() => {
                // Revert to original content or switch back to the input view
                if (isOutputPopulated) {
                    processedText.innerHTML = DOMPurify.sanitize(originalProcessedTextContent);
                } else {
                    processedText.innerHTML = '';
                    textInput.style.zIndex = 1;
                    processedText.style.zIndex = -1;
                }
            }, 5000); // 5 seconds
        } else {
            showNotification('AI Detection Result', `AI Detection Score: ${scorePercentage}% AI-generated.`);
        }
    });

    // --- Progress Bar Logic ---
    function setProgress(percentage, message = '') { progressBar.style.width = `${percentage}%`; if (message) progressMessage.textContent = message; }
    function showProgressBar() { progressContainer.classList.remove('hidden'); }
    function hideProgressBar(delay = 500) { setTimeout(() => { progressContainer.classList.add('hidden'); }, delay); }
    function startMessageInterval(expectedTime) { stopMessageInterval(); messageIntervalId = setInterval(() => { progressMessage.classList.add('fading-out'); setTimeout(() => { const randomIndex = Math.floor(Math.random() * loadingMessages.length); progressMessage.textContent = `${loadingMessages[randomIndex]} (est. ${expectedTime}s)`; progressMessage.classList.remove('fading-out'); }, 500); }, 3000); } 
    function stopMessageInterval() { if (messageIntervalId) { clearInterval(messageIntervalId); messageIntervalId = null; } }
    function startProgressBar(duration) { stopProgressBar(); let currentProgress = 0; progressBar.style.width = '0%'; const incrementMillis = 100; const totalSteps = duration * 1000 / incrementMillis; const step = 99 / totalSteps; progressIntervalId = setInterval(() => { currentProgress += step; if (currentProgress >= 99) { currentProgress = 99; stopProgressBar(); } progressBar.style.width = `${currentProgress}%`; }, incrementMillis); } 
    function stopProgressBar() { if (progressIntervalId) { clearInterval(progressIntervalId); progressIntervalId = null; } }
    function stopAllIntervals() { stopMessageInterval(); stopProgressBar(); }

    // --- Theme Switcher Logic ---
    function applyTheme(themeName) {
        const themeClasses = ['light-theme', 'dark-theme', 'nord-theme', 'glass-theme', 'solarized-dark-theme', 'solarized-light-theme', 'gruvbox-theme', 'dracula-theme'];
        document.body.classList.remove('light-mode', ...themeClasses);

        if (themeName && themeName !== 'light') {
            document.body.classList.add(`${themeName}-theme`);
        } else {
            document.body.classList.add('light-theme');
        }

        // Special handling for glass theme
        document.querySelectorAll('.panel, .modal-content, .flashcard-front, .flashcard-back').forEach(el => {
            el.classList.remove('glass-effect');
        });
        if (themeName === 'glass') {
            document.querySelectorAll('.panel, .modal-content, .flashcard-front, .flashcard-back').forEach(el => {
                el.classList.add('glass-effect');
            });
        }
    }

    function updateSelectedThemeButton(themeName) {
        themePreviewButtons.forEach(button => {
            button.classList.toggle('selected', button.dataset.theme === themeName);
        });
    }

    function loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        applyTheme(savedTheme);
        updateSelectedThemeButton(savedTheme);
    }

    themePreviewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const selectedTheme = e.currentTarget.dataset.theme;
            applyTheme(selectedTheme);
            localStorage.setItem('theme', selectedTheme); // Save theme to local storage
            updateSelectedThemeButton(selectedTheme);
            saveUserData(); // Sync settings with Firestore for logged-in user
        });
    });

    // --- Accent Color Logic ---
    function hexToRgb(hex) {
        let r = 0, g = 0, b = 0;
        // 3 digits
        if (hex.length == 4) {
            r = "0x" + hex[1] + hex[1];
            g = "0x" + hex[2] + hex[2];
            b = "0x" + hex[3] + hex[3];
        // 6 digits
        } else if (hex.length == 7) {
            r = "0x" + hex[1] + hex[2];
            g = "0x" + hex[3] + hex[4];
            b = "0x" + hex[5] + hex[6];
        }
        return `${+r},${+g},${+b}`;
    }

    function applyAccentColor(color) {
        document.documentElement.style.setProperty('--accent-color', color);
        // Simple darken effect for the dark variant
        const rgb = hexToRgb(color);
        const [r, g, b] = rgb.split(',').map(Number);
        const darkenFactor = 0.8;
        const darkColor = `rgb(${Math.round(r * darkenFactor)}, ${Math.round(g * darkenFactor)}, ${Math.round(b * darkenFactor)})`;
        document.documentElement.style.setProperty('--accent-color-dark', darkColor);
        document.documentElement.style.setProperty('--accent-color-rgb', rgb);
    }

    function updateSelectedAccentColorButton() {
        accentColorButtons.forEach(button => {
            button.classList.toggle('selected', button.dataset.color === selectedAccentColor);
        });
    }

    function loadAccentColor() {
        selectedAccentColor = localStorage.getItem('accentColor') || '#4a89dc';
        applyAccentColor(selectedAccentColor);
        updateSelectedAccentColorButton();
    }

    accentColorButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            selectedAccentColor = e.currentTarget.dataset.color;
            applyAccentColor(selectedAccentColor);
            localStorage.setItem('accentColor', selectedAccentColor);
            updateSelectedAccentColorButton();
            saveUserData();
        });
    });

    // --- Model Selection Logic ---
    function updateSelectedModelButton() {
        modelSelectButtons.forEach(button => {
            button.classList.toggle('selected', button.dataset.model === selectedModel);
        });
    }

    function loadModel() {
        selectedModel = localStorage.getItem('ai_humanizer_selected_model') || 'gemini-2.5-flash-lite';
        updateSelectedModelButton();
    }

    modelSelectButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            selectedModel = e.currentTarget.dataset.model;
            localStorage.setItem('ai_humanizer_selected_model', selectedModel);
            updateSelectedModelButton();
            saveUserData();
        });
    });

    // --- Translation Language Logic ---
    function loadTranslationLanguage() {
        const savedLanguage = localStorage.getItem('translationLanguage') || 'Japanese';
        selectedTranslationLanguage = savedLanguage;
        translationLanguageSelect.value = savedLanguage;
    }

    translationLanguageSelect.addEventListener('change', (e) => {
        selectedTranslationLanguage = e.target.value;
        localStorage.setItem('translationLanguage', selectedTranslationLanguage);
        saveUserData();
    });

    // --- Typing Sound Logic ---
    function loadTypingSound() {
        const savedSound = localStorage.getItem('typingSound') || 'none';
        selectedTypingSound = savedSound;
        typingSoundSelect.value = savedSound;
    }

    typingSoundSelect.addEventListener('change', (e) => {
        selectedTypingSound = e.target.value;
        localStorage.setItem('typingSound', selectedTypingSound);
        saveUserData();
    });

    // --- Layout Mode Logic ---
    function applyLayoutMode(isVertical) {
        document.body.classList.toggle('vertical-layout', isVertical);
        layoutModeToggle.checked = isVertical;
    }

    function loadLayoutMode() {
        const savedLayout = localStorage.getItem('layoutMode') === 'true';
        applyLayoutMode(savedLayout);
    }

    layoutModeToggle.addEventListener('change', (e) => applyLayoutMode(e.target.checked));







    // --- API Key ---
    saveApiKeyButton.addEventListener('click', () => {
        const feedbackElement = document.getElementById('save-api-key-feedback');
        const key = apiKeyInput.value.trim();
        if (key) {
            localStorage.setItem('geminiApiKey', key);
            geminiApiKey = key;
            saveUserData(); // Sync settings with Firestore for logged-in user
            feedbackElement.textContent = 'API Key Saved!';
            feedbackElement.style.color = '#28a745';
            feedbackElement.classList.add('visible');
            setTimeout(() => { feedbackElement.classList.remove('visible'); closeSettingsModal(); }, 1500);
        } else {
            feedbackElement.textContent = 'Please enter a valid API key.';
            feedbackElement.style.color = '#dc3545';
            feedbackElement.classList.add('visible');
            setTimeout(() => { feedbackElement.classList.remove('visible'); }, 2000);
        }
    });

    saveSaplingApiKeyButton.addEventListener('click', () => {
        const feedbackElement = saveSaplingApiKeyFeedback;
        const key = saplingApiKeyInput.value.trim();
        if (key) {
            localStorage.setItem('saplingApiKey', key);
            saplingApiKey = key;
            saveUserData(); // Sync settings with Firestore for logged-in user
            feedbackElement.textContent = 'Sapling API Key Saved!';
            feedbackElement.style.color = '#28a745';
            feedbackElement.classList.add('visible');
            setTimeout(() => { feedbackElement.classList.remove('visible'); closeSettingsModal(); }, 1500);
        } else {
            feedbackElement.textContent = 'Please enter a valid Sapling API key.';
            feedbackElement.style.color = '#dc3545';
            feedbackElement.classList.add('visible');
            setTimeout(() => { feedbackElement.classList.remove('visible'); }, 2000);
        }
    });

    function loadApiKey() {
        const savedKey = localStorage.getItem('geminiApiKey');
        if (savedKey) {
            geminiApiKey = savedKey;
            apiKeyInput.value = savedKey;
        } else {
            // Only open settings if Gemini API key is missing
            // openSettingsModal();
        }
    }

    function loadSaplingApiKey() {
        const savedKey = localStorage.getItem('saplingApiKey');
        if (savedKey) {
            saplingApiKey = savedKey;
            saplingApiKeyInput.value = savedKey;
        }
    }

    // --- API & Main Processing Logic ---
    async function extractWordsAndPhrases(text, sourceLanguage) {
        // Explicitly escape newline characters for the prompt to ensure they are preserved.
        const sanitizedText = text.replace(/\n/g, '\\n');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${geminiApiKey}`;
        let prompt;
        if (sourceLanguage === 'Japanese' || sourceLanguage === 'Chinese') {
            // For non-spaced languages, avoid asking for 'spaces' as separate components
            // and clarify newline handling
            prompt = `Analyze the following text in ${sourceLanguage} and extract a comprehensive list of its meaningful linguistic units. Include individual words, punctuation, and explicit newline characters (\\n) ONLY if they are present in the original text as separate elements in the array. Preserve the original order and casing. Return the result as a single JSON array of strings.\n\nText: "吾輩は猫である。名前はまだない。\\nどこで生まれたか頓と見当がつかぬ。"\n\nExample Output:
["吾輩", "は", "猫", "である", "。", "\\n", "名前", "は", "まだ", "ない", "。", "\\n", "どこで", "生まれたか", "頓と", "見当が", "つかぬ", "。"]

Your turn. Text: "${sanitizedText}"`;
        } else {
            // For spaced languages, include spaces as separate components
prompt = `Analyze the following text in ${sourceLanguage} and extract a list of its meaningful components.\n- Include individual words, punctuation, and spaces as separate elements. Crucially, every single newline character (\\n) must be preserved as a distinct, separate element in the array. For example, a blank line (two consecutive newlines) must be represented as two separate "\\n" elements in the array.\n- Prioritize keeping common multi-word expressions (e.g., "such as", "artificial intelligence") as single elements.\n- **Strictly preserve the original casing of each component.**\n- Return the result as a single JSON array of strings.\n\nText: "${sanitizedText}"`;
        }
        const requestBody = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { "response_mime_type": "application/json" } };
        try {
            const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
            if (!response.ok) return { status: 'error', message: 'Failed to extract phrases from API.' };
            const data = await response.json();
            const resultText = data.candidates[0]?.content?.parts[0]?.text;
            if (!resultText) return { status: 'error', message: 'API returned empty response for phrase extraction.' };
            const jsonMatch = resultText.match(/[\[\s\S\]]*/);
            if (!jsonMatch) return { status: 'error', message: 'Could not find valid JSON array in the API response.' };
            const cleanedText = jsonMatch[0];
            return { status: 'success', data: JSON.parse(cleanedText) };
        } catch (error) {
            console.error('Phrase extraction error:', error);
            return { status: 'error', message: 'Network error or other issue.' };
        }
    }

    // --- Language Detection Function ---
    async function detectLanguage(text) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${geminiApiKey}`;
        const prompt = `Detect the language of the following text. Respond with only the name of the language in English (e.g., "English", "Japanese", "German", "Spanish", "Chinese", "Hindi", "Portuguese", "Russian"). If the language cannot be confidently detected, respond with "Unknown".\n\nText: "${text}"`;
        const requestBody = { contents: [{ parts: [{ text: prompt }] }] };
        try {
            const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
            if (!response.ok) return 'Unknown';
            const data = await response.json();
            const detectedLang = data.candidates[0]?.content?.parts[0]?.text.trim();
            return detectedLang || 'Unknown';
        } catch (error) {
            console.error('Language detection error:', error);
            return 'Unknown';
        }
    }

    // --- AI Content Detection Function ---
    async function detectAiContent(text) {
        if (!saplingApiKey) {
            return { status: 'error', message: 'Sapling API key is not set.' };
        }
        const url = 'https://api.sapling.ai/api/v1/aidetect';
        const requestBody = {
            key: saplingApiKey,
            text: text,
            score_string: true // Request highlighted HTML
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const status = response.status;
                const errorText = await response.text(); // Use .text() to be safe
                
                let errorMessage;
                try {
                    const errorData = JSON.parse(errorText); // Try to parse as JSON
                    errorMessage = errorData.detail || errorData.message || `API returned status ${status}. Check the console for details.`;
                } catch (e) {
                    errorMessage = `API returned status ${status}. The response was not valid JSON. Check the console for the full response.`;
                }
                return { status: 'error', message: `Sapling API Error: ${errorMessage}` };
            }

            const data = await response.json();
            return { status: 'success', data: data };

        } catch (error) {
            console.error("Sapling AI detection error:", error);
            return { status: 'error', message: 'Network error or other issue.' };
        }
    }

    async function fetchSynonymsInBatch(words, text, sourceLanguage, translationLanguage) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${geminiApiKey}`;
        const prompt = `First, analyze the overall tone of the following full text in ${sourceLanguage} (e.g., Formal, Casual, Academic). Then, for each word/phrase in the following JSON array, provide contextual synonyms that match that overall tone.\n\nFull text:\n"""
${text}
"""

Words to analyze: ${JSON.stringify(words)}

Return a single JSON object. The keys of this object should be the original words/phrases.
The value for each key must be an array of objects, where each object represents a distinct meaning of the word in the text based on its context.
Each object in the array must have the following structure:
{
  "pos": "The specific part of speech in context (e.g., \"Noun\", \"Verb\").",
  "meaning": "A brief ${translationLanguage} definition of the word in that context.",
  "context_phrase": "A short snippet from the text showing the word in context.",
  "synonyms": "An array of exactly 3 synonym objects in ${sourceLanguage} that fit the text's overall tone. If 3 are not available, provide as many as you can. Each object should have a 'word' and a 'translation' (in ${translationLanguage}) key. Unless a synonym is a proper noun, its 'word' value should be entirely lowercase."
}

Example for the word 'book' in 'I need to book a flight to read a book.' (Source: English, Translation: Japanese):
"book": [
  { "pos": "Verb", "meaning": "予約する", "context_phrase": "...to book a flight...", "synonyms": [{ "word": "reserve", "translation": "予約する" }, { "word": "schedule", "translation": "予定する" }] },
  { "pos": "Noun", "meaning": "本", "context_phrase": "...read a book.", "synonyms": [{ "word": "volume", "translation": "巻" }, { "word": "publication", "translation": "出版物" }] }
]
`;
        const requestBody = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { "response_mime_type": "application/json" } };
        try {
            const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
            if (!response.ok) {
                 const errorData = await response.json();
                 const errorMessage = errorData.error?.message || 'Unknown API error';
                 return { status: 'error', message: `API Error: ${errorMessage}` };
            }
            const data = await response.json();

            if (!data.candidates || data.candidates.length === 0) {
                let message = 'The API returned no synonym candidates.';
                if (data.promptFeedback && data.promptFeedback.blockReason) {
                    message += ` This might be due to a safety policy violation. Reason: ${data.promptFeedback.blockReason}.`;
                } else {
                    message += ' This can happen with certain types of text. Please try modifying your input.';
                }
                return { status: 'error', message: message };
            }

            const resultText = data.candidates[0]?.content?.parts[0]?.text;
            if (resultText) {
                            // Extract JSON object from the raw text response
                            const jsonMatch = resultText.match(/\{[\s\S]*\}/);
                            if (!jsonMatch) {
                                return { status: 'error', message: 'Could not find valid JSON object in the API response for synonyms.' };
                            }
                            const cleanedText = jsonMatch[0];
                            const rawSynonymData = JSON.parse(cleanedText);
                
                            // キーを小文字に正規化する処理を追加
                            const normalizedSynonymData = {};
                            for (const key in rawSynonymData) {
                                if (Object.prototype.hasOwnProperty.call(rawSynonymData, key)) {
                                    normalizedSynonymData[key.toLowerCase()] = rawSynonymData[key];
                                }
                            }
                            return { status: 'success', data: normalizedSynonymData };            } else {
                return { status: 'error', message: 'API returned an empty response part.' };
            }
        } catch (error) {
            console.error('Fetch or other error:', error);
            return { status: 'error', message: 'Network error or other issue.' };
        }
    }

    function renderProcessedText(synonymData, parts) {
        let htmlString = '';
        let wordIdCounter = 0;
        const wordUsageCount = {};

        parts.forEach((part, index) => {
            // Check if the part consists only of whitespace and newline characters
            if (/^\s*\n+\s*$/.test(part)) {
                const newlineCount = (part.match(/\n/g) || []).length;
                htmlString += '<br>'.repeat(newlineCount);
            } else {
                // This is not a newline part, process as a word or punctuation
                let meanings = synonymData[part.toLowerCase()];
                if (meanings && !Array.isArray(meanings)) {
                    meanings = [meanings];
                }
                if (meanings && meanings.length > 0) {
                    const usageIndex = wordUsageCount[part] || 0;
                    const data = meanings[usageIndex % meanings.length];
                    wordUsageCount[part] = usageIndex + 1;
                    if (data && data.synonyms && data.synonyms.length > 0) {
                        wordIdCounter++;
                        const wordId = `word-${wordIdCounter}`;
                        htmlString += `<span id="${wordId}" class="replaceable" data-original-word="${part}">${part}</span>`;
                    } else {
                        htmlString += part;
                    }
                } else {
                    htmlString += part;
                }
            }
        });

        processedText.innerHTML = DOMPurify.sanitize(htmlString);
    }

    function renderSynonymList(synonymData, parts) {
        synonymList.innerHTML = '';
        let wordIdCounter = 0;
        let replaceableFound = false;
        const wordUsageCount = {};
        parts.forEach(part => {
            let meanings = synonymData[part.toLowerCase()];
            if (meanings && !Array.isArray(meanings)) {
                meanings = [meanings];
            }
            if (meanings && meanings.length > 0) {
                const usageIndex = wordUsageCount[part] || 0;
                const data = meanings[usageIndex % meanings.length];
                wordUsageCount[part] = usageIndex + 1;
                if (data && data.synonyms && data.synonyms.length > 0) {
                    replaceableFound = true;
                    wordIdCounter++;
                    const wordId = `word-${wordIdCounter}`;
                    const groupId = `group-${wordIdCounter}`;
                    createSynonymGroup(part, data, wordId, groupId);
                }
            }
        });
        if (!replaceableFound) {
            synonymList.innerHTML = '<p class="placeholder">No synonyms found for the words in your text.</p>';
        }
    }

    function renderSynonymCandidates(synonymData, parts) {
        renderProcessedText(synonymData, parts);
        renderSynonymList(synonymData, parts);
    }

    function createSynonymGroup(originalWord, data, wordId, groupId) {
        const group = document.createElement('div');
        group.id = groupId;
        group.className = 'synonym-group';
        group.style.position = 'relative'; // Needed for absolute positioning of children

        const bookmarkBtn = document.createElement('i');
        const bookmarks = getBookmarks();
        const isBookmarked = bookmarks.some(b => b.originalWord === originalWord && b.context_phrase === data.context_phrase);
        bookmarkBtn.className = `bookmark-btn ${isBookmarked ? 'fas' : 'far'} fa-bookmark ${isBookmarked ? 'bookmarked' : ''}`;
        bookmarkBtn.title = 'Bookmark this word';
        // Manual absolute positioning
        bookmarkBtn.style.position = 'absolute';
        bookmarkBtn.style.top = '8px';
        bookmarkBtn.style.right = '8px';
        bookmarkBtn.style.cursor = 'pointer';

        bookmarkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            let currentBookmarks = getBookmarks();
            const alreadyExistsIndex = currentBookmarks.findIndex(b => b.originalWord === originalWord && b.context_phrase === data.context_phrase);
            if (alreadyExistsIndex > -1) {
                currentBookmarks.splice(alreadyExistsIndex, 1);
                bookmarkBtn.classList.remove('fas', 'bookmarked');
                bookmarkBtn.classList.add('far');
            } else {
                const newBookmark = { originalWord, pos: data.pos, meaning: data.meaning, context_phrase: data.context_phrase, synonyms: data.synonyms };
                currentBookmarks.push(newBookmark);
                bookmarkBtn.classList.remove('far');
                bookmarkBtn.classList.add('fas', 'bookmarked');
            }
            saveBookmarks(currentBookmarks);
        });

        const favoriteBtn = document.createElement('i');
        const favorites = getFavorites();
        const isFavorited = favorites.some(f => f.originalWord === originalWord && f.context_phrase === data.context_phrase);
        favoriteBtn.className = `favorite-btn ${isFavorited ? 'fas' : 'far'} fa-heart`;
        favoriteBtn.title = 'Favorite this word';
        // Manual absolute positioning to the left of the bookmark icon
        favoriteBtn.style.position = 'absolute';
        favoriteBtn.style.top = '8px';
        favoriteBtn.style.right = '30px'; // Position left of the other icon
        favoriteBtn.style.fontSize = '1.1em';
        favoriteBtn.style.cursor = 'pointer';

        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            let currentFavorites = getFavorites();
            const alreadyExistsIndex = currentFavorites.findIndex(f => f.originalWord === originalWord && f.context_phrase === data.context_phrase);
            if (alreadyExistsIndex > -1) {
                currentFavorites.splice(alreadyExistsIndex, 1);
                favoriteBtn.classList.remove('fas');
                favoriteBtn.classList.add('far');
            } else {
                const newFavorite = { originalWord, pos: data.pos, meaning: data.meaning, context_phrase: data.context_phrase, synonyms: data.synonyms };
                currentFavorites.push(newFavorite);
                favoriteBtn.classList.remove('far');
                favoriteBtn.classList.add('fas');
            }
            saveFavorites(currentFavorites);
        });

        group.appendChild(favoriteBtn);
        group.appendChild(bookmarkBtn);

        group.addEventListener('mouseenter', () => document.getElementById(wordId).classList.add('highlight'));
        group.addEventListener('mouseleave', () => document.getElementById(wordId).classList.remove('highlight'));
        const originalWordEl = document.createElement('div');
        originalWordEl.className = 'original-word selected';
        originalWordEl.innerHTML = DOMPurify.sanitize(`${originalWord} <span class="pos">(${data.pos || ''})</span> <span class="translation">(${data.meaning || data.translation || ''})</span>`);
        group.appendChild(originalWordEl);
        const allClickableItems = [originalWordEl];
        data.synonyms.slice(0, 3).forEach(syn => { 
            const item = document.createElement('div'); 
            item.className = 'synonym-item'; 
            item.innerHTML = DOMPurify.sanitize(`<span class="synonym-word">${syn.word}</span> <span class="translation">(${syn.translation || ''})</span>`); 
            group.appendChild(item); 
            allClickableItems.push(item); 
        });
        allClickableItems.forEach(item => { 
            item.addEventListener('click', (e) => {
                allClickableItems.forEach(i => i.classList.remove('selected'));
                const clickedItem = e.currentTarget;
                clickedItem.classList.add('selected');
                const wordSpan = document.getElementById(wordId);
                const newWord = clickedItem.querySelector('.synonym-word')?.textContent || originalWord;
                wordSpan.textContent = newWord;
                if (newWord === originalWord) {
                    wordSpan.classList.remove('modified');
                } else {
                    wordSpan.classList.add('modified');
                }
            }); 
        });
        synonymList.appendChild(group);
    }

    processButton.addEventListener('click', async () => {
        if (!checkUsageLimit()) return;
        if (!geminiApiKey) { alert('Please set your Gemini API key in the settings first.'); openSettingsModal(); return; }
        const text = textInput.value;
        if (!text.trim()) return;

        // --- Show Skeleton Loaders ---
        synonymList.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const skeletonCard = document.createElement('div');
            skeletonCard.className = 'skeleton-card shimmer';
            skeletonCard.innerHTML = `
                <div class="skeleton-title"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text short"></div>
            `;
            synonymList.appendChild(skeletonCard);
        }

        recordUsage();
        const roughWordCount = text.trim().split(/\s+/).length;
        const expectedTime = Math.round(15 + roughWordCount * 1.2);
        let isProcessing = true;
        showProgressBar();
        setProgress(5, `Initializing... (est. ${expectedTime}s)`);
        startMessageInterval(expectedTime);
        startProgressBar(expectedTime);

        // Step 1: Detect Language
        setProgress(10, 'Step 1/3: Detecting language...');
        const sourceLanguage = await detectLanguage(text);
        if (sourceLanguage === 'Unknown') {
            alert('Could not confidently detect the language of the text. Please try again with more text or a different language.');
            hideProgressBar();
            stopAllIntervals();
            return;
        }

        // Step 2: Analyze text structure
        setProgress(35, `Step 2/3: Analyzing text structure in ${sourceLanguage}...`);
        const phraseExtractionResult = await extractWordsAndPhrases(text, sourceLanguage);
        if (phraseExtractionResult.status === 'error') {
            alert(phraseExtractionResult.message);
            hideProgressBar();
            stopAllIntervals();
            return;
        }
        const parts = phraseExtractionResult.data;
        const uniqueWordsAndPhrases = [...new Set(parts.filter(p => {
            const lowerCasePart = p.toLowerCase();
            return p.trim() !== '' && !stopWords.has(lowerCasePart);
        }))];
        const timeoutId = setTimeout(() => { if (isProcessing) { stopMessageInterval(); setProgress(99, 'May take some extra time...'); } }, expectedTime * 1000);
        textInput.style.zIndex = -1;
        processedText.style.zIndex = 1;
        if (uniqueWordsAndPhrases.length === 0) {
            renderSynonymCandidates({}, parts);
            addHistoryItem(text, parts, {});
            isProcessing = false;
            clearTimeout(timeoutId);
            stopAllIntervals();
            hideProgressBar();
            return;
        }

        // Step 3: Fetch contextual synonyms
        setProgress(70, `Step 3/3: Fetching contextual synonyms in ${sourceLanguage} (translating to ${selectedTranslationLanguage})...`);
        const result = await fetchSynonymsInBatch(uniqueWordsAndPhrases, text, sourceLanguage, selectedTranslationLanguage);
        isProcessing = false;
        clearTimeout(timeoutId);
        stopAllIntervals();
        if (result.status === 'error') {
            alert(result.message || 'An unknown error occurred.');
            const placeholder = document.createElement('p');
            placeholder.className = 'placeholder';
            placeholder.textContent = result.message;
            synonymList.innerHTML = ''; // Clear previous content
            synonymList.appendChild(placeholder);
            processedText.innerHTML = DOMPurify.sanitize(text.replace(/\n/g, '<br>'));
            hideProgressBar();
            return;
        }
        const synonymData = result.data;
        renderSynonymCandidates(synonymData, parts);
        addHistoryItem(text, parts, synonymData);
        setProgress(100, 'Done!');
        hideProgressBar(1500);
    });

    // --- (Old Save Version Logic - Now handled by dropdown) ---

    let isPro = false;

    // --- Pro Feature Unlock ---
    const PROMO_CODE = "easyhumanize01"; // A secret promo code

    function updateHumanizerFeatureUI() {
        if (auth.currentUser) {
            proFeatureSection.classList.remove('hidden');
            if (isPro) {
                reciprocalPromptButton.classList.remove('hidden');
                promoCodeContainer.classList.add('hidden');
                humanizerUnlockedView.classList.remove('hidden');
            } else {
                reciprocalPromptButton.classList.add('hidden');
                promoCodeContainer.classList.remove('hidden');
                humanizerUnlockedView.classList.add('hidden');
            }
        } else {
            proFeatureSection.classList.add('hidden');
            reciprocalPromptButton.classList.add('hidden');
        }
    }

    applyPromoCodeButton.addEventListener('click', async () => {
        const user = auth.currentUser;
        if (!user) {
            showNotification('Login Required', 'You must be logged in to apply a promo code.');
            return;
        }

        const code = promoCodeInput.value.trim();
        if (code === PROMO_CODE) {
            const userDocRef = doc(db, "users", user.uid);
            try {
                await setDoc(userDocRef, { settings: { isPro: true } }, { merge: true });
                isPro = true;
                updateHumanizerFeatureUI();
                promoCodeFeedback.textContent = 'Success! Pro features unlocked.';
                promoCodeFeedback.style.color = '#28a745';
                promoCodeFeedback.classList.add('visible');
                setTimeout(() => promoCodeFeedback.classList.remove('visible'), 3000);
            } catch (error) {
                console.error("Error updating user to Pro:", error);
                promoCodeFeedback.textContent = 'An error occurred. Please try again.';
                promoCodeFeedback.style.color = '#dc3545';
                promoCodeFeedback.classList.add('visible');
            }
        } else {
            promoCodeFeedback.textContent = 'Invalid promo code.';
            promoCodeFeedback.style.color = '#dc3545';
            promoCodeFeedback.classList.add('visible');
            setTimeout(() => promoCodeFeedback.classList.remove('visible'), 2000);
        }
    });

    // --- Initialization ---
    loadApiKey();
    loadTheme();
    loadLayoutMode();
    loadModel();
    loadTranslationLanguage();
    loadSaplingApiKey();
    loadAccentColor();
    loadTypingSound();
    textInput.style.zIndex = 1;
    processedText.style.zIndex = -1;

    reciprocalPromptButton.addEventListener('click', async () => {
        let textToProcess = '';
        if (window.getComputedStyle(processedText).zIndex > window.getComputedStyle(textInput).zIndex) {
            textToProcess = processedText.innerText;
        } else {
            textToProcess = textInput.value;
        }

        if (!textToProcess.trim()) {
            textToProcess = textInput.value || processedText.innerText;
        }

        if (!textToProcess.trim()) {
            showNotification('No text to process', 'Please enter or generate some text first.');
            return;
        }

        if (!geminiApiKey) {
            alert('Please set your Gemini API key in the settings first.');
            openSettingsModal();
            return;
        }

        showProgressBar();
        setProgress(30, 'Detecting language...');

        try {
            const sourceLanguage = await detectLanguage(textToProcess);
            if (sourceLanguage === 'Unknown') {
                showNotification('Language Not Detected', 'Could not determine the language of the text. Please try with a different text.');
                hideProgressBar();
                return;
            }

            setProgress(50, 'Generating response...');

            const promptText = `あなたは、AI検出器を回避するために、入力されたテキストを「再構築」する専門家です。 あなたのタスクは、AIが生成した「完璧で流暢すぎる」原文を、**「英語が母国語ではない人物（例：日本語話者）が、自分の母国語から英語に直訳した」**かのように書き直すことです。 ### 1. 動作モードと制約 1. **一貫性の維持（最重要）:** 入力テキストがどれほど長くても（複数のパラグラフであっても）、**最初から最後まで、すべてのパラグラフとすべての文に対して**、以下の「非ネイティブ翻訳」プロセスを厳格かつ均一に適用し続けてください。途中で流暢な（AI的な）スタイルに戻ることを固く禁じます。 2. **トーン（厳守）:** Semi-formalだが、ぎこちない（Clunky / Translationese）。 3. **内容（厳守）:** 元のテキストが持つ「核となる概念」は維持してください。 4. **文章量（厳守）:** 元のテキストと**ほぼ同じ文章量**を維持してください。 5. **言語:** 入力されたテキストと同じ言語で出力してください。**出力言語は必ず「${sourceLanguage}」にしてください。** 6. **重要（禁止事項）:** **文法ミスやスペルミスを意図的に加えてはいけません。** ぎこちなさは、あくまで「語彙選択」と「構文」で表現してください。 --- ### 2. 実行プロセス（最重要・検出回避の鍵） あなたのタスクは、AIの「完璧な流暢さ（Fluency）」を**テキスト全体で破壊**することです。 #### ステップ1： AIの「高度な語彙」を「単純な直訳語彙」に置き換える AIが好む、洗練された、一語で完結する動詞や名詞（\`disrupts\`, \`exacerbating\`, \`existential threats\`, \`pressing issues\`, \`trapping\`, \`accelerating\`, \`endangering\`など）を、**テキストの全域で例外なく禁止**します。 代わりに、より単純で、直訳的で、少し「冗長な」表現（動詞句）を**一貫して**使ってください。 * **（推奨する置換例）:** * \`disrupts\` → \`brings confusion to\` / \`makes problems for\` * \`pressing issues\` → \`top tasks\` / \`big problems\` * \`trapping heat\` → \`keep heat\` / \`stop heat from escaping\` * \`accelerating\` → \`makes faster\` / \`speeds up\` #### ステップ2： AIの「流暢な構文」を「ぎこちない構文」に変える AIが使う滑らかな構文（分詞構文や関係代名詞の非制限用法）を**テキストの全域で例外なく禁止**します。 代わりに、直訳したかのような、**文を短く区切り**、単純な接続詞（\`and\`, \`so\`, \`because\`）で繋ぐ、ぎこちない構文を**一貫して**使ってください。 * **（推奨する構文例）:** * AI: \`...polar ice caps are melting, endangering species like polar bears and accelerating global warming by reducing...\` * ↓ * 修正案: \`...polar ice caps are melting. This is dangerous for animals like polar bears. Also, this makes global warming faster because...\` (文を分割し、単純な接続詞を使う) #### ステップ3： 禁止事項（AIヒューマナイザーのパターン回避） 以下の「いかにも人間らしい」とAIが学習したパターンは**一切禁止**します。 * **感情語・常Tokyo句:** \`I think\`, \`I believe\`, \`I feel\`, \`let's be honest\`, \`We tend to forget...\` * **AI接続詞:** \`Furthermore\`, \`Moreover\`, \`Therefore\`, \`Thus\`, \`It is worth noting that\` #### ステップ4： 最終出力チェック（句読点の厳格な禁止） 上記のプロセスを**テキスト全体に適用**した後、最終出力の前に、以下の句読点を**すべて削除**してください。 * **アポストロフィ（'）:** 例: don't → do not, can't → cannot * **ハイフン（-）:** 例: state-of-the-art → state of the art ### 3. あなたへの最終指示 * **思考プロセス:** 上記のステップ1〜4を厳密に実行してください。 * **出力:** 修正されたテキストのみを出力してください。思考プロセスや言い訳、追加のコメントは一切含めないでください。 ### 4. 処理するテキスト:`;

            const result = await callGeminiPro(textToProcess, promptText);

            if (result.status === 'success') {
                textInput.style.zIndex = -1;
                processedText.style.zIndex = 1;
                processedText.innerText = result.data;
                synonymList.innerHTML = '<p class="placeholder">Humanized text generated. Process again to find synonyms.</p>';
            } else {
                showNotification('Error', result.message);
            }
        } catch (error) {
            console.error('Reciprocal prompt error:', error);
        } finally {
            hideProgressBar();
        }
    });
// Gemini Pro APIを呼び出す関数
async function callGeminiPro(text, userPrompt) {
    // geminiApiKey はグローバルスコープで定義されている前提
    const url =
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiApiKey}`;
    
    // プロンプトとユーザーテキストを結合
    const prompt = `${userPrompt}\n\nText: "${text}"`;
    const requestBody = { contents: [{ parts: [{ text: prompt }] }] };

    try {
        const response = await fetch(url, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(requestBody) 
        });
        
        // エラーレスポンスの処理
        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.error?.message || 'Unknown API error';
            return { status: 'error', message: `API Error: ${errorMessage}` };
        }
        
        const data = await response.json();
        // 結果テキストの抽出
        const resultText = data.candidates[0]?.content?.parts[0]?.text;
        
        if (resultText) {
            return { status: 'success', data: resultText };
        } else {
            return { status: 'error', message: 'API returned an empty response.' };
        }
    } catch (error) {
        console.error('Gemini Pro call error:', error);
        return { status: 'error', message: 'Network error or other issue.' };
    }
}

// モーダルを閉じる処理（モーダル要素が使用されている場合のために残します）
closeReciprocalPromptModalButton.addEventListener('click', () => {
    // reciprocalPromptModal はグローバルスコープで定義されている前提
    reciprocalPromptModal.classList.add('hidden');
});

reciprocalPromptOkButton.addEventListener('click', () => {
    reciprocalPromptModal.classList.add('hidden');
});

reciprocalPromptModal.addEventListener('click', (e) => {
    if (e.target === reciprocalPromptModal) {
        reciprocalPromptModal.classList.add('hidden');
    }
});