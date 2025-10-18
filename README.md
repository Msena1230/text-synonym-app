# Synonym Finder / AI Humanizer

This is a web application that helps users find contextual synonyms for words in an English text. It uses the Google Gemini API to analyze the text and suggest alternatives, allowing users to rephrase and improve their writing.

## Features

- **Contextual Synonym Suggestions:** Analyzes the entire text to provide synonyms that fit the specific context.
- **Interactive Text Replacement:** Click on words and their suggested synonyms to see changes in real-time.
- **Cloud Sync with Firebase:** User authentication and data synchronization (history, bookmarks) using Firebase Auth and Firestore.
- **Flashcard Quiz:** Review bookmarked words with a built-in flashcard system.
- **Customizable Themes:** Includes multiple themes such as Light, Dark, Nord, and Glassmorphism.

## Live Demo

You can try the live application here: [https://synonym-finder1.web.app](https://synonym-finder1.web.app)

## Getting Started (Running Locally)

To run this project on your local machine, follow these steps:

1.  **Clone the repository:**
    ```
    git clone https://github.com/your-username/your-repository-name.git
    cd your-repository-name
    ```

2.  **Install dependencies:**
    ```
    npm install
    ```

3.  **Set up Firebase:**
    *   Create your own project on the [Firebase Console](https://console.firebase.google.com/).
    *   Copy `firebase-config.example.js` to a new file named `firebase-config.js`.
    *   Paste your own Firebase project configuration into `firebase-config.js`.
    *   Enable **Authentication (Google Sign-In)** and **Firestore** in your Firebase project.

4.  **Set up Gemini API Key:**
    *   Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   In the running application, open the settings and paste your API key.

5.  **Run the local server:**
    This project does not use a bundler and can be served with any simple static server. Python's built-in server is a good option.
    ```
    python -m http.server
    ```

6.  **Open the application:**
    Open your browser and navigate to `http://localhost:8000`.
