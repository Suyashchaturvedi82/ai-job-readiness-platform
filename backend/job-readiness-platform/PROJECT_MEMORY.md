# PROJECT_MEMORY.md
> Any AI assistant (or future-you): read this first before touching the code.

## 1. What this project is
AI Job Readiness & Interview Intelligence Platform — matches a candidate's
resume/skills against a job description, scores readiness, generates a prep
roadmap, and runs an AI mock interview.

## 2. Tech stack
- Backend: Java 21, Spring Boot 3.x, Spring Security, Spring Data JPA, Lombok
- Frontend: React (Vite), Axios, React Router
- DB: PostgreSQL 16 (+ pgvector extension — added Day 4)
- Cache/session: Redis 7
- AI: Google Gemini API (structured JSON output)
- Infra: Docker Compose (local), Render/Railway + Vercel (deploy, Day 5)

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

## 5. Database entities (current)
User, Resume, JobDescription, Skill, Analysis, AnalysisSkill — all implemented,
Flyway-managed (V1__init_schema.sql). RoadmapItem, InterviewSession,
InterviewQuestion, InterviewAnswer, Evaluation planned for Day 4 (V2 migration).
## 6. API endpoints implemented so far
| Method | Path | Auth? | Purpose |
|---|---|---|---|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login, get JWT |
| GET | /api/users/me | Yes | Verify current authenticated user |
| POST | /api/resumes | Yes | Upload resume (multipart), Tika text extraction |
| POST | /api/job-descriptions | Yes | Paste JD text |
| POST | /api/analyses | Yes | Extract skills (cached), compute gap + readiness score |
## 7. Environment variables needed (names only — never commit values)
- GEMINI_API_KEY
- JWT_SECRET
- DB_URL / DB_USER / DB_PASSWORD
- REDIS_HOST / REDIS_PORT

## 8. Decisions & why (running log)
- (Day 2 items already listed)
- Gemini skill extraction cached in Redis by SHA-256 hash of the input text —
  avoids repeat AI cost/latency for identical resume/JD content.
- Skill-gap comparison and readiness scoring are pure Java (SkillGapService),
  unit-tested without Spring context — not delegated to the LLM.
- Ownership check (IDOR prevention) in AnalysisService — resume/JD must belong
  to the authenticated user (derived from JWT), never trust a client-sent userId.
- Naive lowercase skill-name matching is a known gap — synonym matching
  (React vs ReactJS) deferred to Day 4's embeddings work.
faster.

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