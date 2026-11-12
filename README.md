# Nirapod — VAT & Tax Workflow Demo

An independent Angular web application for officers and taxpayers, backed by a shared Spring Boot API and MySQL database. The portfolio walkthrough demonstrates a notice being issued, answered and reviewed across two sessions.

## Try the demo

After deployment, put the live HTTPS URL and the public demo-account password here. The backend's opt-in demo profile creates officer@nirapod.example, taxpayer@nirapod.example and taxpayer2@nirapod.example. Their initial password is the DEMO_PASSWORD supplied to the backend.

1. Open an officer session and create a notice for Demo Taxpayer One.
2. Open a private browser session, log in as that taxpayer and reply.
3. Refresh the officer notice page and read the saved reply.
4. Use Taxpayer Two to confirm that another person's profile, notice and private documents cannot be opened.

Use fictional information throughout the public demo.

## Run locally

Install the dependencies with `npm ci`, then run `npm start`. The development API defaults to http://localhost:8080/api. Start the backend separately.

`npm run build` creates `dist/nirapod`. It first checks import-path casing so errors that appear on Linux are caught locally as well.

`ng test --watch=false --browsers=ChromeHeadless --include=src/app/core/services/auth.service.spec.ts` runs the focused release regressions for failed login, token handling and API failures.

## Free deployment with Render and Aiven

The backend repository supplies its own Dockerfile and Render Free service blueprint, and uses your Aiven MySQL database. This repository supplies a Render Static Site blueprint.

1. Deploy the backend and obtain its HTTPS URL.
2. Connect this frontend repository to Render through its `render.yaml`.
3. Set `NIRAPOD_API_URL=https://YOUR_API.onrender.com/api` in the frontend build environment. Set `NIRAPOD_DEMO_PASSWORD` to the same demo-only password used by the backend so the login buttons can fill it. This password is intentionally public in the browser; use a separate value from all real credentials.
4. Set the backend's `APP_FRONTEND_URL` to the exact frontend HTTPS origin, without a trailing slash.
5. Build and deploy the frontend. The blueprint rewrites browser routes to index.html.
6. Verify login, the notice walkthrough and refresh on a direct notice link in the newly deployed build.

The generated browser configuration contains the public API URL, demo mode and optional public demo password. Database, JWT and mail credentials belong on the backend. A production build without an explicit API URL uses /api, suitable for a same-origin reverse proxy.

Render Free backend services sleep on idle, so the first request can take about a minute. The backend demo profile discards outbound mail. The seeded demo users are already verified.

## Implementation and scope

- Angular 13 web frontend, Spring Boot 3.4 API and MySQL.
- Server-side taxpayer ownership checks and officer role checks.
- JWT-backed login with explicit failure states.
- Protected document downloads and database upload storage for the free deployment.
- API-backed notice, dashboard and import duty views.
- Separate native Android and Flutter clients can reuse the API. Their releases need separate verification.
- Activity history is currently unavailable in the demo.
- The web build retains bundle and stylesheet size warnings. Component stylesheet errors are limited to 24 kB, with warnings above 10 kB.
- Angular 13 and its matching Node 16 build toolchain are legacy versions. Plan a supported-version upgrade before extending this into a maintained product.

For the API configuration, seeded data and backend tests, see the backend repository's README.

## Portfolio presentation

After checking the deployed walkthrough, add 3–4 sanitized screenshots and a short recording here. Put the live URL in the GitHub repository Website field. Suggested About text:

Independent VAT and tax workflow demo for officers and taxpayers, built with Angular, Spring Boot and MySQL.

Suggested topics are angular, spring-boot, mysql and tax-management.
