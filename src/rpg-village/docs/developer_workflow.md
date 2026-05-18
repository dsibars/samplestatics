# Developer Workflow & Testing Guidelines

## Local Testing

When testing the application using the browser subagent or manually, **do not** start a local development server (like `npm run dev` or `vite`).

Instead, strictly follow this workflow:

1. **Build the Application**: 
   Always run the build command to generate the latest static files for local testing:
   ```bash
   make local-build APP=rpg-village
   ```

2. **Open the Local File**:
   Access the game by opening the generated HTML file directly in the browser using the `file://` protocol along with the absolute path to the file on your machine:
   - `file://<absolute-path-to-project>/rpg-village.html` (or the debug equivalent, e.g., `rpg-village_debug.html`).

This ensures testing is performed on the exact compiled bundle that will be used in production/distribution.
