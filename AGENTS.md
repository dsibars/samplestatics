# Agent Instructions and Constraints

Welcome to the **Static Web App Hub** repository. As an AI agent working within this codebase, you must adhere strictly to the following architectural constraints and instructions.

## ⚠️ Architecture Constraints & Requirements

**This project MUST remain a 100% static application ecosystem.**

It is designed to be hosted directly on GitHub Pages and accessed seamlessly from a mobile browser. Any technical decisions or iterations you make must respect the following rules:

1. **No Backend or Database**: We will not connect to any server or external database. All user data is stored strictly on the device using `localStorage`. 
2. **Static Hosting Compatibility**: The project must run flawlessly when served via GitHub Pages. Opening the static HTML files must not require server-side rendering or routing that breaks traditional static serving.
3. **PWA / Offline First**: Because there is no backend, the applications are built to function offline. 
4. **Data Persistence**: `localStorage` is our primary storage mechanism. Features like JSON Import/Export are critical for users to retain or move their data between devices.
5. **App Structure**: The repository contains a central `hub` application and several independent applications (Workout Tracker, Money Tracker, Todo List, Tower Defense) located within the `src/` directory.

## Build and Execution Process

This repository does not use traditional standalone `npm run` commands from the root directory for serving or building the entire project out of the box because of its multi-app nature. 

Instead, a custom `Makefile` is provided to orchestrate the build process reliably using `nvm` and `vite`.

### Building the Project

**CRITICAL INSTRUCTION**: Whenever you modify any JavaScript, CSS, or HTML code inside the `src/` directories, you **MUST** run the build process to reflect those changes in the compiled HTML files located at the root of the project.

To build all applications within the repository, execute the following command in the terminal:

```bash
make build-all
```

Or to build a specific app (e.g., the hub):
```bash
make build APP=hub
```

### What the Makefile does:
- Ensures the correct Node environment via `nvm`.
- Installs or updates dependencies using `npm install`.
- Uses `vite build` to bundle the applications into standalone single-file HTML documents (e.g. `todo-list.html`), copying them to the root directory from the `dist/` folder.
- Generates both production (`app.html`) and debug (`app_debug.html`) variants.

**Do not attempt to guess or brute-force `npm` scripts or `vite` commands directly in the root directory.** Rely solely on the provided `make build` and `make build-all` commands to compile the applications.
