# 15 Minute Workout Tracker

A simple MVP web application to count and register daily exercises.

## ⚠️ Architecture Constraints & Requirements

**This project MUST remain a 100% static application.**

It is designed to be hosted directly on GitHub Pages and accessed seamlessly from a mobile browser. Any future technical decisions or iterations must respect the following rules:

1. **No Backend or Database**: We will not connect to any server or external database. All user data is stored strictly on the device using `localStorage`.
2. **Static Hosting Compatibility**: The project must run flawlessly when served via GitHub Pages. Opening the static HTML files (whether single-file or with separated assets) must not require server-side rendering or routing that breaks traditional static serving.
3. **Data Persistence**: Because there is no backend, `localStorage` is our primary storage mechanism. Features like JSON Import/Export are critical for users to retain or move their data between devices.
