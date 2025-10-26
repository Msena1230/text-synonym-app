import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';


document.addEventListener('DOMContentLoaded', () => {


    // --- Firebase Initialization ---
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
    /* Solarized Dark Theme */
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

    /* Solarized Light Theme */
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

    /* Gruvbox Theme */
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

    /* Dracula Theme */
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
    const historyPanel = document.querySelector('.history-panel');
    const historyList = document.getElementById('history-list');
    const clearHistoryButton = document.getElementById('clear-history-button');
    const settingsButton = document.getElementById('settings-button');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsModalButton = document.getElementById('close-settings-modal');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiKeyButton = document.getElementById('save-api-key');
    const saplingApiKeyInput = document.getElementById('sapling-api-key-input');
    const saveSaplingApiKeyButton = document.getElementById('save-sapling-api-key');
    const saveSaplingApiKeyFeedback = document.getElementById('save-sapling-api-key-feedback');
    const themePreviewButtons = document.querySelectorAll('.theme-preview-button');
    const accentColorButtons = document.querySelectorAll('.accent-color-button');
    const modelSelectButtons = document.querySelectorAll('.model-select-button');
    const layoutModeToggle = document.getElementById('layout-mode-toggle');
    const translationLanguageSelect = document.getElementById('translation-language-select');
    const typingSoundSelect = document.getElementById('typing-sound-select');
    const bookmarkListButton = document.getElementById('bookmark-list-button');
    const bookmarkModal = document.getElementById('bookmark-modal');
    const closeBookmarkModalButton = document.getElementById('close-bookmark-modal');
    const bookmarkList = document.getElementById('bookmark-list');
    const startFlashcardsButton = document.getElementById('start-flashcards-button');

    // --- New Favorites Elements ---
    const favoriteListButton = document.getElementById('favorite-list-button');
    const favoriteModal = document.getElementById('favorite-modal');
    const closeFavoriteModalButton = document.getElementById('close-favorite-modal');
    const favoriteList = document.getElementById('favorite-list');
    const startFavoriteFlashcardsButton = document.getElementById('start-favorite-flashcards-button');

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
    const devLoginButton = document.getElementById('dev-login-button');

    const devPasswordInput = document.getElementById('dev-password');
    const devLoginFeedback = document.getElementById('dev-login-feedback');
    const developerLoginContainer = document.getElementById('developer-login-container');
    const developerMemoContainer = document.getElementById('developer-memo-container');
    const devMemoPad = document.getElementById('dev-memo-pad');


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
    let isDevLoggedIn = false; // Tracks if developer has logged in

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
            historyPanel.style.display = 'flex';
            await loadDataFromFirestore(user);
        } else {
            userProfile.classList.add('hidden');
            guestView.classList.remove('hidden');
            userName.textContent = '';
            
            // --- Guest Mode: History Disabled ---
            history = [];
            historyList.innerHTML = '<p class="placeholder">Please log in to use the history feature.</p>';
            historyPanel.style.display = 'none';

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
                updateSelectedThemeButton(userSettings.theme || 'light');
                updateSelectedModelButton();
                updateSelectedAccentColorButton();
                translationLanguageSelect.value = selectedTranslationLanguage;
                typingSoundSelect.value = selectedTypingSound;
                saplingApiKeyInput.value = saplingApiKey;
                apiKeyInput.value = geminiApiKey;
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
                saveUserData();
            }
            renderHistory();
        } catch (error) {
            console.error("Error loading data from Firestore: ", error);
            loadHistory();
            renderBookmarks();
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
                typingSound: selectedTypingSound
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
        const newItem = { id: Date.now(), text, parts, synonymData };
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
    };

    const loadHistoryItem = (id) => {
        const item = history.find(h => h.id === id);
        if (item) {
            textInput.value = item.text;
            activeHistoryId = id;
            if (item.synonymData && item.parts) {
                renderSynonymCandidates(item.synonymData, item.parts);
            } else {
                processedText.innerHTML = '';
                synonymList.innerHTML = '<p class="placeholder">No synonym data saved. Process again.</p>';
            }
            textInput.style.zIndex = -1;
            processedText.style.zIndex = 1;
            renderHistory();
            textInput.dispatchEvent(new Event('input', { bubbles: true }));
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
    };

    const clearHistory = () => {
        if (confirm('Are you sure you want to clear all history?')) {
            history = [];
            activeHistoryId = null;
            textInput.value = '';
            processedText.innerHTML = '';
            saveHistory();
            renderHistory();
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
            item.innerHTML = `
                <div class="bookmark-item-content">
                    <div class="original">${bookmark.originalWord} <span class="pos">(${bookmark.pos})</span><span class="translation">(${bookmark.meaning || bookmark.translation || ''})</span></div>
                    <p class="item-context">...${bookmark.context_phrase}...</p>
                    <ul class="bookmark-synonyms">${synonymsHTML}</ul>
                </div>
                <button class="remove-bookmark-btn" data-word="${bookmark.originalWord}" data-context="${bookmark.context_phrase}"><i class="fas fa-trash-alt"></i></button>
            `;
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
            item.innerHTML = `
                <div class="bookmark-item-content">
                    <div class="original">${favorite.originalWord} <span class="pos">(${favorite.pos})</span><span class="translation">(${favorite.meaning || favorite.translation || ''})</span></div>
                    <p class="item-context">...${favorite.context_phrase}...</p>
                    <ul class="bookmark-synonyms">${synonymsHTML}</ul>
                </div>
                <button class="remove-bookmark-btn" data-word="${favorite.originalWord}" data-context="${favorite.context_phrase}"><i class="fas fa-trash-alt"></i></button>
            `;
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
        flashcardBack.innerHTML = `
            <div class="flashcard-back-content">
                <div class="original">${cardData.originalWord} <span class="pos">(${cardData.pos})</span><span class="translation">(${cardData.meaning || cardData.translation || ''})</span></div>
                <p class="item-context">...${cardData.context_phrase}...</p>
                <ul class="bookmark-synonyms">${synonymsHTML}</ul>
            </div>
        `;
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
            case ' ':
            case 'ArrowUp':
            case 'ArrowDown':
                e.preventDefault();
                flashcard.click();
                break;
        }
    });

    // --- Modal Logic ---
    const openSettingsModal = () => settingsModal.classList.remove('hidden');
    const closeSettingsModal = () => {
        settingsModal.classList.add('hidden');
        // Reset developer zone view
        const loginContainer = document.getElementById('developer-login-container');
        if(loginContainer) loginContainer.classList.remove('hidden');
        developerMemoContainer.classList.add('hidden');
        devPasswordInput.value = '';
        devLoginFeedback.classList.remove('visible');
        isDevLoggedIn = false;
        devAccessLevel = null;
        currentMemoDocRef = null;
        devMemoPad.value = '';
        devMemoPad.setAttribute('readonly', true);
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
            processedText.innerHTML = scoreStringHtml;
            showNotification('AI Detection Result', `AI Detection Score: ${scorePercentage}% AI-generated.\nHighlighted parts indicate AI-generated content.`);

            setTimeout(() => {
                // Revert to original content or switch back to the input view
                if (isOutputPopulated) {
                    processedText.innerHTML = originalProcessedTextContent;
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

    // --- Helper for SHA-256 Hashing ---
    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    // --- Developer Zone Logic ---
    const devAccounts = {
        // Set 1
        '0fc2e3d4c35968ee6f4b627b496736dc232c9422c63ffc96118f04222c0404c1': { level: 'readonly', memoId: 'apiMemo_1' }, // israpicodeisr
        'a24125089ac9f110389cb6dd4b8a3195cbf12b531ceef7ad8b787e9cd372f9fb': { level: 'readwrite', memoId: 'apiMemo_1' }, // MSena19231230
        // Set 2
        'ce82226da6a1d0120c614c88e2e1bd0df5f6adb429174893fe1adcf60afe0f09': { level: 'readonly', memoId: 'apiMemo_2' }, // isrjaps0001
        '23323429612711146d0e8462fff979a00a24639df5e8059b322df69a6486d6b1': { level: 'readwrite', memoId: 'apiMemo_2' }, // MSena192312300001
        // Set 3
        '4079793e291bdaa6bc82f658d8cc838f982c435f914e61435bd02ae256689b38': { level: 'readonly', memoId: 'apiMemo_3' }, // isrjaps2000
        'ff2ec3436c8c8fa5b7b4ab437dede17afa04f7fa0a63a8d9eee7d87b44702738': { level: 'readwrite', memoId: 'apiMemo_3' }  // MSena192312302000
    };
    let devAccessLevel = null;
    let currentMemoDocRef = null;

    devLoginButton.addEventListener('click', async () => {
        const password = devPasswordInput.value;
        if (!password) return;
        const inputPassHash = await sha256(password);
        const account = devAccounts[inputPassHash];

        if (account) {
            devAccessLevel = account.level;
            isDevLoggedIn = true;
            currentMemoDocRef = doc(db, 'devMemos', account.memoId);

            try {
                const docSnap = await getDoc(currentMemoDocRef);
                if (docSnap.exists()) {
                    devMemoPad.value = docSnap.data().content || '';
                } else {
                    // If the document doesn't exist, create it with a default message
                    await setDoc(currentMemoDocRef, { content: `Welcome to memo ${account.memoId}. Start typing here...` });
                    devMemoPad.value = `Welcome to memo ${account.memoId}. Start typing here...`;
                }
            } catch (error) {
                console.error("Error fetching dev memo: ", error);
                devMemoPad.value = 'Error fetching memo.';
            }

            // Hide the login form and show the memo container
            const loginContainer = document.getElementById('developer-login-container');
            if(loginContainer) loginContainer.classList.add('hidden');
            developerMemoContainer.classList.remove('hidden');

            if (devAccessLevel === 'readonly') {
                devMemoPad.setAttribute('readonly', true);
            } else {
                devMemoPad.removeAttribute('readonly');
            }

        } else {
            devLoginFeedback.textContent = 'Invalid credentials.';
            devLoginFeedback.style.color = '#dc3545';
            devPasswordInput.value = '';
            devLoginFeedback.classList.add('visible');
            setTimeout(() => { devLoginFeedback.classList.remove('visible'); }, 2000);
        }
    });

    devMemoPad.addEventListener('input', async () => {
        if (devAccessLevel === 'readwrite' && currentMemoDocRef) {
            try {
                // Use setDoc with merge:true to avoid overwriting other fields if they exist
                await setDoc(currentMemoDocRef, { content: devMemoPad.value }, { merge: true });
            } catch (error) {
                console.error("Error auto-saving dev memo: ", error);
            }
        }
    });





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
            prompt = `Analyze the following text in ${sourceLanguage} and extract a comprehensive list of all its meaningful components. It is crucial that you include individual words, punctuation, spaces, and explicit newline characters (\\n) ONLY if they are present in the original text as separate elements in the array. Preserve the original order and casing. Return the result as a single JSON array of strings.\n\nText: "He decided to give up.\\nThen he looked for a new job."

Example Output:
["He", " ", "decided", " ", "to", " ", "give up", ".", "\\n", "Then", " ", "he", " ", "looked for", " ", "a", " ", "new", " ", "job", "."]

Your turn. Text: "${sanitizedText}"`;
        }
        const requestBody = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { "response_mime_type": "application/json" } };
        try {
            const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
            if (!response.ok) return { status: 'error', message: 'Failed to extract phrases from API.' };
            const data = await response.json();
            const resultText = data.candidates[0]?.content?.parts[0]?.text;
            if (!resultText) return { status: 'error', message: 'API returned empty response for phrase extraction.' };
            const jsonMatch = resultText.match(/\[.*\]/s);
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
            score_string: true, // Request highlighted HTML
            version: '20240606' // Use the latest version
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
                const errorData = await response.json();
                const errorMessage = errorData.detail || errorData.message || 'Unknown API error from Sapling.';
                return { status: 'error', message: `Sapling API Error: ${errorMessage}` };
            }

            const data = await response.json();
            return { status: 'success', data: data };

        } catch (error) {
            console.error('Sapling AI detection error:', error);
            return { status: 'error', message: 'Network error or other issue with Sapling API.' };
        }
    }

    async function fetchSynonymsInBatch(words, text, sourceLanguage, translationLanguage) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${geminiApiKey}`;
        const prompt = `Given the following full text in ${sourceLanguage}:
"""
${text}
""

For each word/phrase in the following JSON array, analyze all its occurrences within the full text and provide contextual information.
Words to analyze: ${JSON.stringify(words)}

Return a single JSON object. The keys of this object should be the original words/phrases.
The value for each key must be an array of objects, where each object represents a distinct meaning of the word in the text based on its context.
Each object in the array must have the following structure:
{
  "pos": "The specific part of speech in context (e.g., \"Noun\", \"Verb\").",
  "meaning": "A brief ${translationLanguage} definition of the word in that context.",
  "context_phrase": "A short snippet from the text showing the word in context.",
  "synonyms": "An array of exactly 3 synonym objects in ${sourceLanguage} if possible. If 3 are not available, provide as many as you can. Each object should have a 'word' and a 'translation' (in ${translationLanguage}) key."
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
            const resultText = data.candidates[0]?.content?.parts[0]?.text;
            if (resultText) {
                const jsonMatch = resultText.match(/\{.*\}/s);
                if (!jsonMatch) return { status: 'error', message: 'Could not find valid JSON object in the API response.' };
                const cleanedText = jsonMatch[0];
                return { status: 'success', data: JSON.parse(cleanedText) };
            } else {
                return { status: 'error', message: 'API returned empty response.' };
            }
        } catch (error) {
            console.error('Fetch or other error:', error);
            return { status: 'error', message: 'Network error or other issue.' };
        }
    }

    function renderSynonymCandidates(synonymData, parts) {
        synonymList.innerHTML = '';
        processedText.innerHTML = '';
        let wordIdCounter = 0;
        let replaceableFound = false;
        const wordUsageCount = {};
        parts.forEach(part => {
            const meanings = synonymData[part];
            if (meanings && meanings.length > 0) {
                const usageIndex = wordUsageCount[part] || 0;
                const data = meanings[usageIndex % meanings.length];
                wordUsageCount[part] = usageIndex + 1;
                if (data && data.synonyms && data.synonyms.length > 0) {
                    replaceableFound = true;
                    wordIdCounter++;
                    const wordId = `word-${wordIdCounter}`;
                    const groupId = `group-${wordIdCounter}`;
                    const span = document.createElement('span');
                    span.textContent = part;
                    span.id = wordId;
                    span.className = 'replaceable';
                    span.dataset.originalWord = part;
                    processedText.appendChild(span);
                    createSynonymGroup(part, data, wordId, groupId);
                } else {
                    if (/^\n+$/.test(part)) {
                        for (let i = 0; i < part.length; i++) {
                            processedText.appendChild(document.createElement('br'));
                        }
                    } else {
                        processedText.appendChild(document.createTextNode(part));
                    }
                }
            } else {
                if (/^\n+$/.test(part)) {
                    for (let i = 0; i < part.length; i++) {
                        processedText.appendChild(document.createElement('br'));
                    }
                } else {
                    processedText.appendChild(document.createTextNode(part));
                }
            }
        });
        if (!replaceableFound) {
            synonymList.innerHTML = '<p class="placeholder">No synonyms found for the words in your text.</p>';
        }
    }

    function createSynonymGroup(originalWord, data, wordId, groupId) {
        const group = document.createElement('div');
        group.id = groupId;
        group.className = 'synonym-group';
        group.style.position = 'relative'; // Needed for absolute positioning of children

        const bookmarkBtn = document.createElement('i');
        const bookmarks = getBookmarks();
        const isBookmarked = bookmarks.some(b => b.originalWord === originalWord && b.context_phrase === data.context_phrase);
        bookmarkBtn.className = `bookmark-btn fas fa-bookmark ${isBookmarked ? 'bookmarked' : ''}`;
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
                bookmarkBtn.classList.remove('bookmarked');
            } else {
                const newBookmark = { originalWord, pos: data.pos, meaning: data.meaning, context_phrase: data.context_phrase, synonyms: data.synonyms };
                currentBookmarks.push(newBookmark);
                bookmarkBtn.classList.add('bookmarked');
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
        originalWordEl.innerHTML = `${originalWord} <span class="pos">(${data.pos || ''})</span> <span class="translation">(${data.meaning || data.translation || ''})</span>`;
        group.appendChild(originalWordEl);
        const allClickableItems = [originalWordEl];
        data.synonyms.slice(0, 3).forEach(syn => { 
            const item = document.createElement('div'); 
            item.className = 'synonym-item'; 
            item.innerHTML = `<span class="synonym-word">${syn.word}</span> <span class="translation">(${syn.translation || ''})</span>`; 
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
            // Filter for words that are likely to have synonyms in the source language
            // Removed p.match(/[a-zA-Z]/) to support non-English languages
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
            synonymList.innerHTML = `<p class="placeholder">${result.message}</p>`;
            processedText.innerHTML = text.replace(/\n/g, '<br>');
            hideProgressBar();
            return;
        }
        const synonymData = result.data;
        renderSynonymCandidates(synonymData, parts);
        addHistoryItem(text, parts, synonymData);
        setProgress(100, 'Done!');
        hideProgressBar(1500);
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
});
