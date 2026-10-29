# Deploy StudySprint v2 on Render

The v2 application uses the **Express JavaScript framework** and a server-side **OpenAI Responses API tool-calling agent**. The existing GitHub Pages URL remains a local-planner demonstration; it cannot run the Express backend.

## Create the service

1. Open [Deploy to Render](https://render.com/deploy?repo=https://github.com/wrightiv-dotcom/studysprint), or connect the Render integration and select this repository.
2. Use the committed `render.yaml` Blueprint. It creates a Node web service on the free plan. Alternatively create a Web Service using `main`, build command `npm ci`, start command `npm start`, and health path `/api/health`.
3. In Render's private Environment settings, set `OPENAI_API_KEY` to your own or instructor-authorized key. **Do not put the key in GitHub, browser JavaScript, report, screenshots, or chat.**
4. Keep `OPENAI_MODEL=gpt-5-mini`, `AI_ENABLED=true`, and `TZ=UTC`. The key needs access to this model and API billing/credits. Change `OPENAI_MODEL` privately if using another compatible model.
5. Deploy. Use the actual URL Render returns; no Render URL is assumed in this repository.
6. Open `/api/health` and `/api/config`. Health should say `Express`; configuration should contain `aiAvailable: true` and must not contain the key.
7. Open SprintBot, select **AI agent**, enter a sample assignment and your available hours, confirm the data-sharing choice, and submit. Expand tool activity to demonstrate `read_assignment`, `get_availability`, and `check_schedule`.
8. Review and approve the proposal. Try insufficient availability to show the shortfall and approval check.

After a successful live test, add the actual Render URL to the README and LaTeX report, recompile the report, and copy the PDF/source into `dist/report/` before running `npm run prepare:pages`.

## Local development

Requires Node.js 22 or newer:

```sh
npm ci
# Copy .env.example to .env and enter a real key only in the ignored .env file.
npm start
```

Open `http://localhost:3000`. With no key, the Express website still runs and local planning works; live AI is explicitly disabled. Run `npm test` to execute 16 tests. Agent tests simulate provider responses and do not spend API credits.

## Security and operational limits

- Only `dist/` is publicly served. Server files, environment files, and source tests are outside the static web root.
- Model credentials stay in environment variables. The browser receives only an availability boolean and plan results.
- AI submission sends the selected assignment requirements, availability windows, occupied session times, and time zone to the server and OpenAI. Other assignment text is not sent. Consent is required in the interface.
- The provider request uses `store: false`. This does not imply zero provider-side retention; follow your institution's data rules and the provider's data policy.
- The agent has three named tools, at most six model turns, at most eight tool calls, at most three schedule checks, and a 90-second request timeout. Tools cannot execute code, approve plans, or save coursework.
- Requests have input-size checks, same-origin browser restrictions, five AI submissions per visitor per hour, thirty submissions per server per hour, and at most two concurrent agent runs. Limits use in-memory counters and reset on restart; they are not a durable billing cap. Set a provider project spending budget, monitor usage, and set `AI_ENABLED=false` to disable live AI if needed. A larger public deployment needs durable rate limits and stronger abuse controls.
- Availability and occupied times come from the visitor's browser. They are not authenticated calendar records. The server runs in UTC and maps the supplied browser offset to the visitor's calendar; future daylight-saving transitions may require reviewing times.
- Render's free service may sleep; first requests can be slower. A valid key with model access is necessary for a real AI demonstration.

## Class presentation (about five minutes)

1. Introduce the scheduling problem and show the Render-hosted app and GitHub repository.
2. Point to Express in `server/app.cjs` and show the API key **name only**, never its value.
3. Select AI mode, enter a non-sensitive example assignment, and explain the consent notice.
4. Show the agent's tool activity and editable milestones. Explain that the scheduler validates the model's proposal independently.
5. Approve a feasible plan, then demonstrate an infeasible workload. Show the report's artifact table and explain that mock tests do not replace the live model demonstration.

## Official references

- [Express](https://expressjs.com/)
- [Render Express deployment](https://render.com/docs/deploy-node-express-app)
- [Render environment variables](https://render.com/docs/configure-environment-variables)
- [OpenAI function calling](https://developers.openai.com/api/docs/guides/function-calling)
