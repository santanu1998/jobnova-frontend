# JobNova — Frontend

React 19 + Vite + Tailwind + Redux Toolkit client for the JobNova microservices backend
(`Ai_Powered_Job_Board_Platform`). All requests go through the API Gateway.

## Run locally

1. Start the backend (from the backend folder): `mvn -DskipTests install`, then `.\run-local.ps1`.
   The gateway listens on **http://localhost:5000**.
2. Frontend:
   ```bash
   npm install
   npm run dev
   ```
   Open http://localhost:5173.

## Configuration (`.env`, see `.env.example`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://jobnova-santanu.duckdns.org:5000` | JobNova API Gateway |
| `VITE_CLOUDINARY_CLOUD_NAME` | — | Optional, enables photo / logo uploads |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | — | Unsigned upload preset for the above |

During local development, Vite proxies `/api` and `/auth` requests to this URL, avoiding
browser CORS blocks. Set `VITE_API_BASE_URL=http://localhost:5000` to use a local gateway.
For a deployed frontend, Vercel proxies `/api/*` and `/auth/*` to the configured gateway over
the server-side rewrite, so the browser uses the same HTTPS origin and does not need direct
access to the gateway's HTTP port. If calling the gateway directly instead, configure its
`CORS_ALLOWED_ORIGINS` to include the frontend origin and use an HTTPS API URL.

## Deploy to Vercel

The Vercel configuration builds with `npm ci` and `npm run build`, publishes `dist`, proxies
API routes to the gateway, and rewrites client-side routes to `index.html`. Leave
`VITE_API_BASE_URL` unset in Vercel to use the same-origin API proxy. Do not commit local
`.env` files.

## Where things live

- `src/reduxt-store/*Thunk.js` — every backend call (one file per service)
- `src/reduxt-store/api.js` — axios instance, JWT header, error messages
- `src/lib/constants.js` — enum values mirrored from the backend `common-lib`
- `src/pages/user` (job seeker), `src/pages/employer`, `src/pages/admin`

## Roles

`ROLE_JOBSEEKER`, `ROLE_EMPLOYER`, `ROLE_ADMIN` (the admin account is seeded by User-Services).
