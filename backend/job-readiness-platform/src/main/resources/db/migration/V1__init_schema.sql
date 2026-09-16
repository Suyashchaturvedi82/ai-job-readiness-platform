CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE resumes (
                         id BIGSERIAL PRIMARY KEY,
                         user_id BIGINT NOT NULL REFERENCES users(id),
                         file_name VARCHAR(255),
                         raw_text TEXT NOT NULL,
                         uploaded_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_resumes_user_id ON resumes(user_id);

CREATE TABLE job_descriptions (
                                  id BIGSERIAL PRIMARY KEY,
                                  user_id BIGINT NOT NULL REFERENCES users(id),
                                  title VARCHAR(255),
                                  company VARCHAR(255),
                                  raw_text TEXT NOT NULL,
                                  created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_jd_user_id ON job_descriptions(user_id);

CREATE TABLE skills (
                        id BIGSERIAL PRIMARY KEY,
                        name VARCHAR(150) NOT NULL UNIQUE,
                        category VARCHAR(100)
);

CREATE TABLE analyses (
                          id BIGSERIAL PRIMARY KEY,
                          user_id BIGINT NOT NULL REFERENCES users(id),
                          resume_id BIGINT NOT NULL REFERENCES resumes(id),
                          job_description_id BIGINT NOT NULL REFERENCES job_descriptions(id),
                          readiness_score DOUBLE PRECISION,
                          created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_analyses_user_id ON analyses(user_id);

CREATE TABLE analysis_skills (
                                 id BIGSERIAL PRIMARY KEY,
                                 analysis_id BIGINT NOT NULL REFERENCES analyses(id),
                                 skill_id BIGINT NOT NULL REFERENCES skills(id),
                                 status VARCHAR(20) NOT NULL,
                                 priority INT,
                                 UNIQUE(analysis_id, skill_id)
);
CREATE INDEX idx_analysis_skills_analysis_id ON analysis_skills(analysis_id);