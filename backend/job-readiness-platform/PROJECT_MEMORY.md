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
None persisted yet — design finalized (see Decisions section):
User, Resume, JobDescription, Skill, Analysis, AnalysisSkill, RoadmapItem,
InterviewSession, InterviewQuestion, InterviewAnswer, Evaluation.
JPA entities to be implemented Day 2.

## 6. API endpoints implemented so far
None yet — planned list in project notes. Implementation starts Day 2.

## 7. Environment variables needed (names only — never commit values)
- GEMINI_API_KEY
- JWT_SECRET
- DB_URL / DB_USER / DB_PASSWORD
- REDIS_HOST / REDIS_PORT

## 8. Decisions & why (running log)
- Deterministic skill-gap scoring lives in Java, not the LLM — consistency,
  testability, cost.
- Analysis is a hub entity (Resume+JD pairing), not fields bolted onto
  Resume/JobDescription — a resume can be analyzed against multiple JDs.
- Skill is a master catalog table — avoids free-text duplication
  ("Java" vs "java") and enables proper joins.
- Redis + Docker Compose instead of native Windows installs — Redis has
  no official native Windows build; Docker keeps local env == prod-like env.
- Vite over Create React App — CRA is deprecated, Vite is faster.

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