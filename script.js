import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Initialization ---
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // --- Splash Screen Logic ---
    const splashScreen = document.getElementById('splash-screen');
    const line1 = document.getElementById('splash-text-line1');
    const line2 = document.getElementById('splash-text-line2');

    // 1行目のテキストをセット（文字分割はしない）
    line1.textContent = line1.dataset.text;
    line2.textContent = line2.dataset.text;

    // アニメーションのシーケンス (トータル約3秒)
    // 1. ロゴのアニメーションはCSSで自動開始
    // 2. 200ms後、1行目の文字アニメーションを開始
    setTimeout(() => {
        line1.classList.add('active');
    }, 200);

    // 3. 1700ms後（1.5秒後）、2行目のアニメーションを開始
    setTimeout(() => {
        line2.classList.add('active');
    }, 1700);

    // 4. 3200ms後、スプラッシュスクリーン全体をフェードアウト
    setTimeout(() => {
        splashScreen.classList.add('hidden');
    }, 3200);

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

    // History Panel
    const historyList = document.getElementById('history-list');
    const clearHistoryButton = document.getElementById('clear-history-button');

    // Settings Modal
    const settingsButton = document.getElementById('settings-button');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsModalButton = document.getElementById('close-settings-modal');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiKeyButton = document.getElementById('save-api-key');
    // const themeLight = document.getElementById('theme-light'); // 削除
    // const themeDark = document.getElementById('theme-dark');
    // const themeNord = document.getElementById('theme-nord');
    // const themeGlass = document.getElementById('theme-glass');

    const themePreviewButtons = document.querySelectorAll('.theme-preview-button');
    const modelSelectButtons = document.querySelectorAll('.model-select-button');

    // Layout Mode
    const layoutModeToggle = document.getElementById('layout-mode-toggle');

    // Bookmark Modal
    const bookmarkListButton = document.getElementById('bookmark-list-button');
    const bookmarkModal = document.getElementById('bookmark-modal');
    const closeBookmarkModalButton = document.getElementById('close-bookmark-modal');
    const bookmarkList = document.getElementById('bookmark-list');
    const startFlashcardsButton = document.getElementById('start-flashcards-button');

    // Progress Bar
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressMessage = document.getElementById('progress-message');

    // Auth Elements
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const userProfile = document.getElementById('user-profile');
    const userName = document.getElementById('user-name');

    // --- Firebase Auth Logic ---
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in
            console.log('User logged in:', user.displayName);
            await loadDataFromFirestore(user);
            userProfile.classList.remove('hidden');
            loginButton.classList.add('hidden');
            userName.textContent = user.displayName;
        } else {
            // User is signed out
            console.log('User logged out');
            // Clear UI and load from local storage (guest data)
            history = JSON.parse(localStorage.getItem('synonymFinderHistory') || '[]');
            const localBookmarks = JSON.parse(localStorage.getItem('bookmarkedWords') || '[]');
            renderHistory();
            renderBookmarks();

            userProfile.classList.add('hidden');
            loginButton.classList.remove('hidden');
            userName.textContent = '';
        }
    });

    const loadDataFromFirestore = async (user) => {
        const userDocRef = doc(db, "users", user.uid);
        try {
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                console.log("Loading data from Firestore...");
                const data = docSnap.data();
                // Load history and bookmarks from firestore
                history = data.history || [];
                const firestoreBookmarks = data.bookmarks || [];
                // We call saveBookmarks here to update localStorage and the UI button state
                saveBookmarks(firestoreBookmarks);

                renderHistory();
                renderBookmarks(); // renderBookmarks will get data from getBookmarks()
            } else {
                // No document for this user yet. This is their first login.
                console.log("Creating new user document in Firestore with empty data.");
                history = [];
                // saveBookmarks will clear localStorage, render the UI, and trigger a saveUserData call.
                saveBookmarks([]); 
                renderHistory(); // Render the now-empty history
            }
        } catch (error) {
            console.error("Error loading data from Firestore: ", error);
            // Fallback to local storage if firestore fails
            loadHistory();
            renderBookmarks();
        }
    };

    loginButton.addEventListener('click', () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .catch(error => {
                console.error('Login failed', error);
                alert(`Login failed: ${error.message}`);
            });
    });

    logoutButton.addEventListener('click', () => {
        signOut(auth).catch(error => {
            console.error('Logout failed', error);
        });
    });

    // --- State Variables ---
    let geminiApiKey = '';
    let history = [];
    let activeHistoryId = null;
    let messageIntervalId = null;
    let progressIntervalId = null;
    let selectedModel = 'gemini-2.5-flash-lite'; // デフォルト値を設定

    const loadingMessages = [
        'Working on it...',
        'Analyzing your text...',
        'Asking the AI for suggestions...',
        'Still in progress...',
        'Fetching synonyms...',
        'Just a moment longer...',
        'Compiling the results...',
        'Almost there...'
    ];

    // --- History Logic ---
    const saveUserData = async () => {
        const user = auth.currentUser;
        if (!user) return; // Not logged in

        const userDocRef = doc(db, "users", user.uid);
        const dataToSave = {
            history: history,
            bookmarks: getBookmarks(),
            // In the future, we can add other settings here
            // theme: localStorage.getItem('theme'),
        };

        try {
            await setDoc(userDocRef, dataToSave, { merge: true });
            console.log('User data saved to Firestore');
        } catch (error) {
            console.error("Error saving user data to Firestore: ", error);
        }
    };

    const saveHistory = () => {
        localStorage.setItem('synonymFinderHistory', JSON.stringify(history));
        saveUserData(); // Also save to firestore
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
        historyList.innerHTML = ''; // Clear existing list
        if (history.length === 0) {
            historyList.innerHTML = `<p class="placeholder">Your recent searches will appear here. Let's get started!</p>`;
            return;
        }

        const groupedHistory = {
            Today: [],
            Yesterday: [],
            'This Week': [],
            'This Month': [],
            Older: []
        };

        history.forEach(item => {
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
                        if (historyItem.querySelector('input')) return; // Do nothing if renaming
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
                // If title is empty or unchanged, just render the history again to revert
                renderHistory();
            }
        };

        input.addEventListener('blur', save);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur(); // This will trigger the blur event's save function
            } else if (e.key === 'Escape') {
                renderHistory(); // Cancel editing
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
        if (!text || !text.trim()) return;

        const newItem = { id: Date.now(), text, parts, synonymData };

        // Remove potential duplicates before adding
        const existingIndex = history.findIndex(item => item.text === text);
        if (existingIndex > -1) {
            history.splice(existingIndex, 1);
        }

        history.unshift(newItem); // Add to the beginning
        activeHistoryId = newItem.id;
        
        if (history.length > 100) { // Limit history size
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

            // Restore synonym candidates if they exist in the history item
            if (item.synonymData && item.parts) {
                renderSynonymCandidates(item.synonymData, item.parts);
            } else {
                // For older history items that don't have saved synonyms
                processedText.innerHTML = '';
                synonymList.innerHTML = '<p class="placeholder">No synonym data saved for this item. Process again to save.</p>';
            }

            // Ensure the interactive text is visible
            textInput.style.zIndex = -1;
            processedText.style.zIndex = 1;

            renderHistory(); // Update the active state in the history list
            textInput.dispatchEvent(new Event('input', { bubbles: true })); // Update word counter
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


    // --- Utility Functions ---
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    // --- Bookmark Logic ---
    const getBookmarks = () => JSON.parse(localStorage.getItem('bookmarkedWords') || '[]');
    const saveBookmarks = (bookmarks) => {
        localStorage.setItem('bookmarkedWords', JSON.stringify(bookmarks));
        startFlashcardsButton.style.display = bookmarks.length > 0 ? 'block' : 'none';
        saveUserData(); // Also save to firestore
    };

    function renderBookmarks() {
        const bookmarks = getBookmarks();
        bookmarkList.innerHTML = ''; // Clear existing list

        if (bookmarks.length === 0) {
            bookmarkList.innerHTML = '<p class="placeholder">No words bookmarked yet.</p>';
            startFlashcardsButton.style.display = 'none';
            return;
        }
        startFlashcardsButton.style.display = 'block';

        bookmarks.forEach(bookmark => {
            const item = document.createElement('div');
            item.className = 'bookmark-item';
            const synonymsHTML = bookmark.synonyms.map(s => `<li>${s.word} <span class="translation">(${s.translation})</span></li>`).join('');
            item.innerHTML = `
                <div class="bookmark-item-content">
                    <div class="original">${bookmark.originalWord} <span class="pos">(${bookmark.pos})</span><span class="translation">(${bookmark.meaning || bookmark.translation || ''})</span></div>
                    <ul class="bookmark-synonyms">${synonymsHTML}</ul>
                </div>
                <button class="remove-bookmark-btn" data-word="${bookmark.originalWord}"><i class="fas fa-trash-alt"></i></button>
            `;
            bookmarkList.appendChild(item);
        });

        document.querySelectorAll('.remove-bookmark-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const wordToRemove = e.currentTarget.dataset.word;
                let currentBookmarks = getBookmarks();
                currentBookmarks = currentBookmarks.filter(b => b.originalWord !== wordToRemove);
                saveBookmarks(currentBookmarks);
                renderBookmarks(); // Re-render the list
            });
        });
    }

    // --- Flashcard Logic ---
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
    let currentFlashcardIndex = 0;

    const openFlashcardModal = () => {
        const bookmarks = getBookmarks();
        if (bookmarks.length === 0) {
            alert('You have no bookmarked words to quiz!');
            return;
        }
        flashcardQuiz = shuffleArray([...bookmarks]);
        currentFlashcardIndex = 0;
        renderCurrentFlashcard();
        closeBookmarkModal(); // Close the bookmark list
        flashcardModal.classList.remove('hidden');
    };

    const closeFlashcardModal = () => {
        flashcardModal.classList.add('hidden');
        flashcardQuiz = []; // Clear quiz data
    };

    const renderCurrentFlashcard = () => {
        if (currentFlashcardIndex >= flashcardQuiz.length) {
            alert('Quiz complete! Well done!');
            closeFlashcardModal();
            return;
        }

        const cardData = flashcardQuiz[currentFlashcardIndex];
        
        // Reset flip state
        flashcard.classList.remove('is-flipped');

        // Front
        flashcardFront.textContent = cardData.originalWord;

        // Back
        const synonymsHTML = cardData.synonyms.map(s => `<li>${s.word} <span class="translation">(${s.translation})</span></li>`).join('');
        flashcardBack.innerHTML = `
            <div class="flashcard-back-content">
                <div class="original">${cardData.originalWord} <span class="pos">(${cardData.pos})</span><span class="translation">(${cardData.meaning || cardData.translation || ''})</span></div>
                <ul class="bookmark-synonyms">${synonymsHTML}</ul>
            </div>
        `;

        // Progress
        flashcardProgress.textContent = `${currentFlashcardIndex + 1} / ${flashcardQuiz.length}`;
    };

    const deleteCurrentFlashcardAndAdvance = () => {
        if (flashcardQuiz.length === 0) return;

        const wordToDelete = flashcardQuiz[currentFlashcardIndex].originalWord;
        const contextToDelete = flashcardQuiz[currentFlashcardIndex].context_phrase;

        // Remove from main bookmarks in localStorage
        let currentBookmarks = getBookmarks();
        currentBookmarks = currentBookmarks.filter(b => !(b.originalWord === wordToDelete && b.context_phrase === contextToDelete));
        saveBookmarks(currentBookmarks);

        // Remove from current quiz
        flashcardQuiz.splice(currentFlashcardIndex, 1);

        // If we deleted the last card, the index might be out of bounds
        if (currentFlashcardIndex >= flashcardQuiz.length) {
            currentFlashcardIndex = flashcardQuiz.length - 1;
        }
        
        // If the quiz is now empty, close it
        if (flashcardQuiz.length === 0) {
            alert('Quiz complete! Well done!');
            closeFlashcardModal();
            renderBookmarks(); // Refresh bookmark list view
            return;
        }

        renderCurrentFlashcard();
        renderBookmarks(); // Refresh bookmark list view
    };

    startFlashcardsButton.addEventListener('click', openFlashcardModal);
    closeFlashcardModalButton.addEventListener('click', closeFlashcardModal);
    flashcard.addEventListener('click', () => flashcard.classList.toggle('is-flipped'));

    nextFlashcardButton.addEventListener('click', () => {
        if (currentFlashcardIndex < flashcardQuiz.length - 1) {
            currentFlashcardIndex++;
            renderCurrentFlashcard();
        }
    });

    prevFlashcardButton.addEventListener('click', () => {
        if (currentFlashcardIndex > 0) {
            currentFlashcardIndex--;
            renderCurrentFlashcard();
        }
    });

    completeFlashcardButton.addEventListener('click', deleteCurrentFlashcardAndAdvance);

    // キーボードイベントリスナーを追加
    document.addEventListener('keydown', (e) => {
        if (flashcardModal.classList.contains('hidden')) {
            // フラッシュカードモーダルが表示されていない場合は何もしない
            return;
        }

        switch (e.key) {
            case 'ArrowRight':
                e.preventDefault(); // デフォルトのスクロール動作などを防ぐ
                if (currentFlashcardIndex < flashcardQuiz.length - 1) {
                    currentFlashcardIndex++;
                    renderCurrentFlashcard();
                }
                break;
            case 'ArrowLeft':
                e.preventDefault(); // デフォルトのスクロール動作などを防ぐ
                if (currentFlashcardIndex > 0) {
                    currentFlashcardIndex--;
                    renderCurrentFlashcard();
                }
                break;
            case 'ArrowUp':
            case 'ArrowDown':
            case ' ': // スペースキー
                e.preventDefault(); // デフォルトのスクロール動作などを防ぐ
                flashcard.classList.toggle('is-flipped');
                break;
        }
    });

    // --- Modal Logic ---
    const openSettingsModal = () => {
        settingsModal.classList.remove('hidden');
        // 設定モーダルが開いている間は入力フィールドのz-indexをリセット
        textInput.style.zIndex = ''; // または 'auto'
        processedText.style.zIndex = ''; // または 'auto'
    }
    const closeSettingsModal = () => {
        settingsModal.classList.add('hidden');
        // 設定モーダルが閉じられたらz-indexを元に戻す
        textInput.style.zIndex = 1;
        processedText.style.zIndex = -1;
    };
    const openBookmarkModal = () => {
        renderBookmarks();
        bookmarkModal.classList.remove('hidden');
    }
    const closeBookmarkModal = () => bookmarkModal.classList.add('hidden');

    settingsButton.addEventListener('click', openSettingsModal);
    closeSettingsModalButton.addEventListener('click', closeSettingsModal);
    settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeSettingsModal(); });

    bookmarkListButton.addEventListener('click', openBookmarkModal);
    closeBookmarkModalButton.addEventListener('click', closeBookmarkModal);
    bookmarkModal.addEventListener('click', (e) => { if (e.target === bookmarkModal) closeBookmarkModal(); });


    // --- Word Counter Logic ---
    textInput.addEventListener('input', () => {
        const text = textInput.value;
        const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
        wordCounter.textContent = `${wordCount} words`;
    });

    clearTextButton.addEventListener('click', () => {
        textInput.value = '';
        processedText.innerHTML = '';
        textInput.dispatchEvent(new Event('input', { bubbles: true }));
        // Reset z-index to make textarea editable again
        textInput.style.zIndex = 1;
        processedText.style.zIndex = -1;
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
        document.body.classList.remove('light-mode', 'dark-mode', 'nord-theme', 'glass-theme'); // 既存のテーマクラスを全て削除
        // Glassテーマの要素からglass-effectクラスを削除
        document.querySelectorAll('.panel, .modal-content, .flashcard-front, .flashcard-back').forEach(el => {
            el.classList.remove('glass-effect');
        });

        if (themeName === 'light') {
            // Lightモードはデフォルトなので、特にクラスは追加しない
        } else if (themeName === 'dark') {
            document.body.classList.add('dark-mode');
        } else if (themeName === 'nord') {
            document.body.classList.add('nord-theme');
        } else if (themeName === 'glass') {
            document.body.classList.add('glass-theme');
            // Glassテーマの要素にglass-effectクラスを追加
            document.querySelectorAll('.panel, .modal-content, .flashcard-front, .flashcard-back').forEach(el => {
                el.classList.add('glass-effect');
            });
        }
    }
    // themeSwitch.addEventListener('change', (e) => { const isDark = e.target.checked; applyTheme(isDark); localStorage.setItem('theme', isDark ? 'dark' : 'light'); });
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light'; // デフォルトはlight
        applyTheme(savedTheme); // まずテーマを適用

        // 選択されたテーマのボタンをハイライト
        themePreviewButtons.forEach(button => {
            if (button.dataset.theme === savedTheme) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
        });
    }

    // --- Model Selection Logic ---
    function loadModel() {
        const savedModel = localStorage.getItem('ai_humanizer_selected_model') || 'gemini-2.5-flash-lite'; // キーとデフォルト値を変更
        selectedModel = savedModel;

        modelSelectButtons.forEach(button => {
            if (button.dataset.model === savedModel) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
        });
    }

    // --- Layout Mode Logic ---
    function applyLayoutMode(isVertical) {
        document.body.classList.toggle('vertical-layout', isVertical);
        layoutModeToggle.checked = isVertical;
    }

    function loadLayoutMode() {
        const savedLayout = localStorage.getItem('layoutMode') === 'true';
        applyLayoutMode(savedLayout);
    }

    layoutModeToggle.addEventListener('change', (e) => {
        const isVertical = e.target.checked;
        localStorage.setItem('layoutMode', isVertical);
        applyLayoutMode(isVertical);
    });

    // テーマプレビューボタンのイベントリスナー
    themePreviewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const selectedTheme = e.currentTarget.dataset.theme;
            applyTheme(selectedTheme);
            localStorage.setItem('theme', selectedTheme);

            // 選択されたボタンをハイライト
            themePreviewButtons.forEach(btn => btn.classList.remove('selected'));
            e.currentTarget.classList.add('selected');
        });
    });

    // モデル選択ボタンのイベントリスナー
    modelSelectButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const newModel = e.currentTarget.dataset.model;
            selectedModel = newModel;
            localStorage.setItem('ai_humanizer_selected_model', newModel); // キー名を変更

            // 選択されたボタンをハイライト
            modelSelectButtons.forEach(btn => btn.classList.remove('selected'));
            e.currentTarget.classList.add('selected');
        });
    });

    // --- Settings Modal Logic ---
        saveApiKeyButton.addEventListener('click', () => {
        const feedbackElement = document.getElementById('save-api-key-feedback');
        const key = apiKeyInput.value.trim();
        if (key) {
            localStorage.setItem('geminiApiKey', key);
            geminiApiKey = key;
            feedbackElement.textContent = 'API Key Saved!';
            feedbackElement.style.color = '#28a745'; // Green for success
            feedbackElement.classList.add('visible');

            setTimeout(() => {
                feedbackElement.classList.remove('visible');
                closeSettingsModal();
            }, 1500);
        } else {
            feedbackElement.textContent = 'Please enter a valid API key.';
            feedbackElement.style.color = '#dc3545'; // Red for error
            feedbackElement.classList.add('visible');
            setTimeout(() => {
                feedbackElement.classList.remove('visible');
            }, 2000);
        }
    });
    function loadApiKey() { const savedKey = localStorage.getItem('geminiApiKey'); if (savedKey) { geminiApiKey = savedKey; apiKeyInput.value = savedKey; } else { openSettingsModal(); } }

    // --- API & Main Processing Logic ---
    async function extractWordsAndPhrases(text) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${geminiApiKey}`;
        const prompt = `Analyze the following English text and extract a comprehensive list of all its meaningful components. It is crucial that you include individual words, punctuation, phrasal verbs, spaces, and newline characters (\n) as separate elements in the array. Preserve the original order and casing. Return the result as a single JSON array of strings.\n\nText: "He decided to give up.\nThen he looked for a new job."

Example Output:
["He", " ", "decided", " ", "to", " ", "give up", ".", "\n", "Then", " ", "he", " ", "looked for", " ", "a", " ", "new", " ", "job", "."]

Your turn. Text: "${text}"`;
        const requestBody = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { "response_mime_type": "application/json" } };
        try {
            const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
            if (!response.ok) return { status: 'error', message: 'Failed to extract phrases from API.' };
            const data = await response.json();
            const resultText = data.candidates[0]?.content?.parts[0]?.text;
            if (!resultText) return { status: 'error', message: 'API returned empty response for phrase extraction.' };
            return { status: 'success', data: JSON.parse(resultText) };
        } catch (error) {
            console.error('Phrase extraction error:', error);
            return { status: 'error', message: 'Error during phrase extraction.' };
        }
    }

    async function fetchSynonymsInBatch(words, text) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${geminiApiKey}`;
        const prompt = `Given the following full text:
"""
${text}
"""

For each word/phrase in the following JSON array, analyze all its occurrences within the full text and provide contextual information.
Words to analyze: ${JSON.stringify(words)}

Return a single JSON object. The keys of this object should be the original words/phrases.
The value for each key must be an array of objects, where each object represents a distinct meaning of the word in the text based on its context.
Each object in the array must have the following structure:
{
  "pos": "The specific part of speech in context (e.g., "Noun", "Verb").",
  "meaning": "A brief Japanese definition of the word in that context.",
  "context_phrase": "A short snippet from the text showing the word in context.",
  "synonyms": "An array of exactly 3 synonym objects if possible. If 3 are not available, provide as many as you can. Each object should have a 'word' and a 'translation' (in Japanese) key."
}

Example for the word 'book' in 'I need to book a flight to read a book.':
"book": [
  { "pos": "Verb", "meaning": "予約する", "context_phrase": "...to book a flight...", "synonyms": [...] },
  { "pos": "Noun", "meaning": "本", "context_phrase": "...read a book.", "synonyms": [...] }
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
                try {
                    const cleanedText = resultText.replace(/```json\n|```/g, '').trim();
                    return { status: 'success', data: JSON.parse(cleanedText) };
                } catch (parseError) {
                    console.error('JSON Parse Error:', parseError, '\n--- Raw Text from API ---\n', resultText);
                    return { status: 'error', message: 'Failed to parse API response.' };
                }
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
        const wordUsageCount = {}; // To track usage of words with multiple meanings

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
                    span.addEventListener('click', () => { const groupElement = document.getElementById(groupId); groupElement.scrollIntoView({ behavior: 'smooth', block: 'center' }); groupElement.classList.add('scrolled-highlight'); setTimeout(() => groupElement.classList.remove('scrolled-highlight'), 3500); });
                    span.addEventListener('contextmenu', (e) => { e.preventDefault(); const targetSpan = e.target; const original = targetSpan.dataset.originalWord; if (targetSpan.textContent !== original) { targetSpan.textContent = original; targetSpan.classList.remove('modified'); const groupElement = document.getElementById(groupId); const allItems = groupElement.querySelectorAll('.synonym-item, .original-word'); allItems.forEach(item => item.classList.remove('selected')); groupElement.querySelector('.original-word').classList.add('selected'); } });
                    processedText.appendChild(span);
                    createSynonymGroup(part, data, wordId, groupId);
                } else {
                    if (part === '\n') { processedText.appendChild(document.createElement('br')); } else { processedText.appendChild(document.createTextNode(part)); }
                }
            } else {
                 if (part === '\n') { processedText.appendChild(document.createElement('br')); } else { processedText.appendChild(document.createTextNode(part)); }
            }
        });

        if (!replaceableFound) {
            synonymList.innerHTML = '<p class="placeholder">No synonyms found for the words in your text.</p>';
        }
    }

    processButton.addEventListener('click', async () => {
        if (!geminiApiKey) { alert('Please set your Gemini API key in the settings first.'); openSettingsModal(); return; }
        const text = textInput.value;
        if (!text.trim()) return;

        const roughWordCount = text.trim().split(/\s+/).length;
        const expectedTime = Math.round(15 + roughWordCount * 1.2);
        let isProcessing = true;
        showProgressBar();
        setProgress(5, `Initializing... (est. ${expectedTime}s)`);
        startMessageInterval(expectedTime);
        startProgressBar(expectedTime);

        setProgress(10, 'Step 1/2: Analyzing text structure...');
        const phraseExtractionResult = await extractWordsAndPhrases(text);

        if (phraseExtractionResult.status === 'error') { alert(phraseExtractionResult.message); hideProgressBar(); stopAllIntervals(); return; }
        
        const parts = phraseExtractionResult.data;
        const uniqueWordsAndPhrases = [...new Set(parts.filter(p => {
            const lowerCasePart = p.toLowerCase();
            return p.trim() !== '' && p.match(/[a-zA-Z]/) && !stopWords.has(lowerCasePart);
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

        setProgress(50, 'Step 2/2: Fetching contextual synonyms...');
        const result = await fetchSynonymsInBatch(uniqueWordsAndPhrases, text);
        
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

    function createSynonymGroup(originalWord, data, wordId, groupId) {
        const group = document.createElement('div');
        group.id = groupId;
        group.className = 'synonym-group';

        const bookmarkBtn = document.createElement('i');
        const bookmarks = getBookmarks();
        // Check if a bookmark with the same word and context exists
        const isBookmarked = bookmarks.some(b => b.originalWord === originalWord && b.context_phrase === data.context_phrase);
        bookmarkBtn.className = `bookmark-btn ${isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark'}`;
        
        bookmarkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            let currentBookmarks = getBookmarks();
            const alreadyExistsIndex = currentBookmarks.findIndex(b => b.originalWord === originalWord && b.context_phrase === data.context_phrase);

            if (alreadyExistsIndex > -1) {
                currentBookmarks.splice(alreadyExistsIndex, 1); // Remove existing
                bookmarkBtn.className = 'bookmark-btn far fa-bookmark';
            } else {
                // Add new bookmark with context
                const newBookmark = { 
                    originalWord: originalWord, 
                    pos: data.pos, 
                    meaning: data.meaning, 
                    context_phrase: data.context_phrase,
                    synonyms: data.synonyms 
                };
                currentBookmarks.push(newBookmark);
                bookmarkBtn.className = 'bookmark-btn fas fa-bookmark';
            }
            saveBookmarks(currentBookmarks);
        });

        group.appendChild(bookmarkBtn);

        group.addEventListener('mouseenter', () => document.getElementById(wordId).classList.add('highlight'));
        group.addEventListener('mouseleave', () => document.getElementById(wordId).classList.remove('highlight'));

        const originalWordEl = document.createElement('div');
        originalWordEl.className = 'original-word selected';
        originalWordEl.innerHTML = `${originalWord} <span class="pos">(${data.pos || ''})</span> <span class="translation">(${data.meaning || data.translation || ''})</span>`;
        group.appendChild(originalWordEl);

        const allClickableItems = [originalWordEl];
        data.synonyms.slice(0, 3).forEach(syn => { const item = document.createElement('div'); item.className = 'synonym-item'; item.innerHTML = `<span class="synonym-word">${syn.word}</span> <span class="translation">(${syn.translation || ''})</span>`; group.appendChild(item); allClickableItems.push(item); });
        allClickableItems.forEach(item => { item.addEventListener('click', (e) => {
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
        }); });
        synonymList.appendChild(group);
    }

    // --- Initialization ---
    loadApiKey();
    loadTheme();
    // loadHistory(); // Handled by onAuthStateChanged
    loadLayoutMode();
    loadModel();
    textInput.style.zIndex = 1;
    processedText.style.zIndex = -1;
    // renderBookmarks(); // Handled by onAuthStateChanged
});