# StudySprint

A responsive study planner with an animated night sky, editable milestones, availability windows, schedule validation, plan approval, completion tracking, and replanning.

## Run locally

The complete website is in `dist/`:

- `index.html` — page structure and forms
- `style.css` — layout, responsive styles, and night sky theme
- `script.js` — assignments, scheduling, approval, progress, and local storage
- `assets/clouds-night-sky.gif` — animated background

Open `dist/index.html` in a modern browser. No build step or dependencies are required. For a local server, run `npx serve dist`.

## Deploy

GitHub Pages publishes the `docs/` folder on `main` at:

https://wrightiv-dotcom.github.io/studysprint/

To publish website updates:

1. Edit the website files in `dist/`.
2. Run `node scripts/prepare-pages.cjs` to update `docs/`.
3. Commit and push the changed files to `main`.

GitHub automatically rebuilds the site after a push. The repository and deployed website are public. No API keys or custom workflow permissions are required.

## Data and planning

Assignments and availability are saved in browser localStorage. Planning uses local rules, not a language model. External fonts are loaded from Google Fonts.
