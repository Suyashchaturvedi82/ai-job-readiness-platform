CREATE TABLE interview_sessions (
                                    id BIGSERIAL PRIMARY KEY,
                                    analysis_id BIGINT NOT NULL REFERENCES analyses(id),
                                    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
                                    started_at TIMESTAMP NOT NULL DEFAULT now(),
                                    completed_at TIMESTAMP
);
CREATE INDEX idx_interview_sessions_analysis_id ON interview_sessions(analysis_id);

CREATE TABLE interview_questions (
                                     id BIGSERIAL PRIMARY KEY,
                                     session_id BIGINT NOT NULL REFERENCES interview_sessions(id),
                                     skill_id BIGINT REFERENCES skills(id),
                                     question_text TEXT NOT NULL,
                                     difficulty VARCHAR(20) NOT NULL,
                                     sequence_order INT NOT NULL
);
CREATE INDEX idx_interview_questions_session_id ON interview_questions(session_id);

CREATE TABLE interview_answers (
                                   id BIGSERIAL PRIMARY KEY,
                                   question_id BIGINT NOT NULL UNIQUE REFERENCES interview_questions(id),
                                   answer_text TEXT NOT NULL,
                                   submitted_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE evaluations (
                             id BIGSERIAL PRIMARY KEY,
                             answer_id BIGINT NOT NULL UNIQUE REFERENCES interview_answers(id),
                             score INT NOT NULL,
                             feedback TEXT,
                             weak_area_flag BOOLEAN NOT NULL DEFAULT false
);