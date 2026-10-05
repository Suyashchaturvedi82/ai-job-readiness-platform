# PROJECT_MEMORY.md
> Any AI assistant (or future-you): read this first before touching the code.

## 1. What this project is
AI Job Readiness & Interview Intelligence Platform — matches a candidate's
resume/skills against a job description, scores readiness, generates a prep
roadmap, and runs an AI mock interview.
## 2. Tech stack
(add:) pgvector (semantic skill matching), gemini-embedding-001, Render (backend+DB+Redis), Vercel (frontend)

## 3. Architecture
React → Spring Boot REST API → Controller → Service → Repository → PostgreSQL.
JWT secures endpoints (added Day 2). Redis holds interview session state +
AI-response cache. Gemini is called (async, WebClient) for extraction/
evaluation; deterministic scoring logic lives in Java, not the LLM.

## 4. Folder structure
ai-job-readiness-platform/
backend/   (Spring Boot, Maven)
frontend/  (React, Vite)
docker-compose.yml

## 5. Database entities (current) — COMPLETE
User, Resume, JobDescription, Skill (+embedding vector(768)), Analysis, AnalysisSkill,
RoadmapItem, InterviewSession, InterviewQuestion, InterviewAnswer, Evaluation.
Migrations: V1 (core), V2 (pgvector + roadmap), V3 (interview tables).

## 6. API endpoints — COMPLETE
POST /api/auth/register | POST /api/auth/login | GET /api/users/me
POST /api/resumes | GET /api/resumes
POST /api/job-descriptions | GET /api/job-descriptions
POST /api/analyses | GET /api/analyses/{id} | POST /api/analyses/{id}/roadmap
POST /api/interview-sessions | POST /api/interview-sessions/{id}/questions/next
POST /api/interview-sessions/questions/{questionId}/answers
## 7. Environment variables needed (names only — never commit values)
- GEMINI_API_KEY
- JWT_SECRET
- DB_URL / DB_USER / DB_PASSWORD
- REDIS_HOST / REDIS_PORT

## 8. Decisions & why (running log — Day 4/5 additions)
- Semantic skill matching (pgvector + gemini-embedding-001) only runs as a FALLBACK when
  exact-name match fails — keeps most analyses free of extra embedding calls.
- @Transactional self-invocation bug fixed by splitting AnalysisService (orchestration,
  no @Transactional) from AnalysisPersistenceService (DB writes, @Transactional) — Spring's
  proxy only intercepts calls that go through another bean, not calls to `this`.
- Interview session context cached in Redis (2h TTL) alongside Postgres persistence —
  Postgres is source of truth, Redis avoids re-assembling context on every question.
- JWT stored in localStorage on the frontend — pragmatic for MVP; httpOnly cookies would
  be the production-hardened choice (documented trade-off, not implemented).

## 9. Known issues / TODO
- No entities/DB tables yet (Day 2)
- No auth yet (Day 2)
- Gemini integration not started (Day 3)

## 10. Progress log
### Day 1
- Planning finalized: entities, API list, architecture
- Backend scaffolded (Spring Boot, Maven, Java 21) — runs on :8080
- Frontend scaffolded (React + Vite) — runs on :5173
- docker-compose.yml added (Postgres 16 + Redis 7), both containers verified running
- Git repo initialized and pushed to GitHub
- ### Day 2
- Flyway migration V1 (users, resumes, job_descriptions, skills, analyses, analysis_skills)
- JPA entities + repositories for all Day-2 tables
- Spring Security + JWT: register/login/protected endpoint, tested via Postman

### Day 3
- Resume upload (multipart + Apache Tika text extraction)
- Job description text ingestion
- Gemini integration (gemini-flash-latest, structured JSON output via responseSchema)
- Redis caching of skill extraction (content-hash keyed, 7-day TTL)
- Deterministic skill-gap engine + readiness score (unit tested)
- IDOR protection on /api/analyses
- ### Day 4
- pgvector setup + gemini-embedding-001 client, exact+semantic skill matching
- Roadmap generation (single batched Gemini call)
- Mock interview core: sessions/questions/answers/evaluations, Redis context cache
- Fixed @Transactional self-invocation bug in AnalysisService

### Day 5
- CORS configured for frontend origin
- React frontend: auth, dashboard, analysis results, mock interview UI, 3D hero (lazy-loaded)
- Full docker-compose (postgres+redis+backend+frontend), multi-stage Dockerfiles
- Deployed: backend+DB+Redis on Render, frontend on Vercel