# StudySprint

A responsive study planner with an animated night sky, editable milestones, availability windows, schedule validation, plan approval, completion tracking, and replanning. Version 2 adds an **Express JavaScript framework backend** and an **OpenAI tool-calling AI agent**.

## AI framework version: deploy on Render

See [DEPLOYMENT.md](DEPLOYMENT.md) for the Render Blueprint, private environment-variable setup, verification checklist, and class presentation guide. The backend and 16 tests are implemented; the live Render deployment and real-provider smoke test still require the owner's Render connection and privately configured API key.

[Deploy to Render](https://render.com/deploy?repo=https://github.com/wrightiv-dotcom/studysprint)

The AI agent reads assignment and availability through tools, proposes milestones, calls an independent schedule-checking tool, and can revise its draft. Only the student can approve the plan. The frontend explicitly distinguishes **local planning** from **AI agent mode**. No API key belongs in this repository.

## Run locally

The complete website is in `dist/`:

- `index.html` — page structure and forms
- `style.css` — layout, responsive styles, and night sky theme
- `script.js` — assignments, scheduling, approval, progress, and local storage
- `assets/clouds-night-sky.gif` — animated background

For the complete framework application, run `npm ci` followed by `npm start`, then open `http://localhost:3000`. See `.env.example` for variable names only. A real key belongs only in an ignored `.env` file or Render's private Environment settings. Static local planning still works by opening `dist/index.html` without installing dependencies.

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

Local mode uses planning rules and templates without sending assignment data. On the configured Render-hosted Express app, AI mode sends the selected assignment and timing context to OpenAI only after consent. On GitHub Pages, AI mode is unavailable and clearly labeled. An optional separate ChatGPT prompt remains available. Plans are only scheduled after approval.

Run `npm test` for planning and schedule checks. Run `npm run prepare:pages` after editing `dist/`, then commit both `dist/` and `docs/` and push `main` to publish.

## Storage

Assignments and availability are saved in browser localStorage. AI proposals are not automatically saved or approved. Model secrets remain on the Express server. External fonts are loaded from Google Fonts. Browser storage is separate between GitHub Pages and Render because they have different origins.

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
