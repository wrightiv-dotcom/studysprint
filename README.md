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

## SprintBot quick planner

Select **Plan with SprintBot** to create milestones quickly. Paste an assignment, choose a type or let SprintBot select one, set an estimate and deadline, then review the suggested steps and schedule. A list of tasks on separate lines is used directly as editable milestones. Existing completed work is preserved through the original replanning flow.

SprintBot uses local planning rules and templates, not a live language model. It does not send assignment data to a remote service. Its optional AI refinement section provides a prompt you can copy into ChatGPT yourself; no API keys are needed. Plans are only scheduled after approval.

Run `npm test` for planning and schedule checks. Run `npm run prepare:pages` after editing `dist/`, then commit both `dist/` and `docs/` and push `main` to publish.

## Storage

Assignments and availability are saved in browser localStorage. Planning uses local rules, not a language model. External fonts are loaded from Google Fonts.

## Project report

The associated LaTeX report explains the project, implementation artifacts, planning rules, tests, deployment, and limitations. It includes clickable links to the live app and this repository.

- [Read the compiled PDF](output/pdf/studysprint-report.pdf)
- [View the LaTeX source](report/studysprint-report.tex)
- [Download the report from the live site](https://wrightiv-dotcom.github.io/studysprint/report/studysprint-report.pdf)

Compile from the repository root using Tectonic:

```sh
tectonic -o output/pdf report/studysprint-report.tex
```

After updating the report, copy the PDF and `.tex` source into `dist/report/`, run `npm run prepare:pages`, and push `main` to update the website downloads. Do not commit generated LaTeX logs or auxiliary files.
