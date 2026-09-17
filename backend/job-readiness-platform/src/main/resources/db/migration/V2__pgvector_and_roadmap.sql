CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE skills ADD COLUMN embedding vector(768);

CREATE INDEX idx_skills_embedding ON skills USING hnsw (embedding vector_cosine_ops);

CREATE TABLE roadmap_items (
                               id BIGSERIAL PRIMARY KEY,
                               analysis_id BIGINT NOT NULL REFERENCES analyses(id),
                               skill_id BIGINT NOT NULL REFERENCES skills(id),
                               topic VARCHAR(255) NOT NULL,
                               sequence_order INT NOT NULL,
                               estimated_effort_hours INT,
                               UNIQUE(analysis_id, sequence_order)
);
CREATE INDEX idx_roadmap_analysis_id ON roadmap_items(analysis_id);