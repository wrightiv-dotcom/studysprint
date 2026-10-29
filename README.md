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

Publish the `dist` folder using any static website host.

## Data and planning

Assignments and availability are saved in browser localStorage. Planning uses local rules, not a language model. External fonts are loaded from Google Fonts.
