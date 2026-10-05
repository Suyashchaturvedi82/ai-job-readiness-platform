# AI Job Readiness & Interview Intelligence Platform

A full-stack AI job-readiness platform with resume analysis, job matching, personalized roadmap generation, and mock interview evaluation.

## Stack

- Frontend: React 19, Vite, React Router, Three.js / React Three Fiber, Axios
- Backend: Spring Boot 4, Java 21, Spring Security/JWT, PostgreSQL + pgvector, Redis
- AI: Google Gemini for analysis/generation and embeddings
- Deployment: Docker Compose; frontend can also be deployed to Vercel and backend to any Docker-capable host

## Local setup

1. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

2. Set a valid Google AI Studio API key in `GEMINI_API_KEY`. Also replace `JWT_SECRET` with a long random secret.

3. Start the complete stack:

   ```bash
   docker compose up --build
   ```

4. Open:
   - Frontend: http://localhost:5173
   - Backend health: http://localhost:8080/api/health

## Run without Docker

### Backend

```bash
cd backend/job-readiness-platform
./mvnw spring-boot:run
```

The backend reads its connection and AI settings from environment variables. See `backend/job-readiness-platform/.env.example`.

### Frontend

```bash
cd frontend
npm ci --legacy-peer-deps
npm run dev
```

For a remote backend, set `VITE_API_BASE_URL` before building, for example:

```bash
VITE_API_BASE_URL=https://your-backend.example.com/api npm run build
```

## Gemini configuration

The backend uses these variables:

- `GEMINI_API_KEY` — Google AI Studio API key
- `GEMINI_MODEL` — generation model; defaults to `gemini-3.6-flash`
- `GEMINI_EMBEDDING_MODEL` — embedding model; defaults to `gemini-embedding-001`

Do not commit `.env` files or real API keys. If a key has ever been exposed outside your private environment, rotate it and use the replacement in your deployment secret store.

## Docker configuration

`docker compose` passes frontend `VITE_API_BASE_URL` at build time and passes Gemini/CORS settings to the backend container. For a production deployment, set `VITE_API_BASE_URL` to the public backend `/api` URL and set `CORS_ALLOWED_ORIGINS` to the frontend origin(s).

## Validation notes

The source has been syntax-checked for the frontend JavaScript/JSX and backend Java sources. Full Maven/npm runtime validation could not be completed in this sandbox because outbound package/network access is unavailable and Docker is not installed here. The final archive intentionally excludes installed `node_modules`, build outputs, IDE metadata, and real `.env` files; run a clean dependency install/build in an environment with network access.
