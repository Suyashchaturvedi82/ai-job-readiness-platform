package com.suyash.job_readiness_platform.repository;

import com.pgvector.PGvector;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class SkillEmbeddingRepository {
    private final JdbcTemplate jdbcTemplate;

    // IntelliJ warnings ko chup karwane ke liye
    @SuppressWarnings("SqlResolve")
    public void saveEmbedding(Long skillId, float[] embedding) {
        jdbcTemplate.update("UPDATE skills SET embedding = ? WHERE id = ?",
                new PGvector(embedding), skillId);
    }

    // IntelliJ warnings ko chup karwane ke liye
    @SuppressWarnings("SqlResolve")
    public Optional<MatchResult> findBestMatch(List<Long> candidateSkillIds, float[] queryEmbedding) {
        if (candidateSkillIds.isEmpty()) return Optional.empty();
        String placeholders = candidateSkillIds.stream().map(id -> "?").collect(Collectors.joining(","));
        String sql = """
            SELECT id, name, 1 - (embedding <=> ?) AS similarity
            FROM skills
            WHERE id IN (%s) AND embedding IS NOT NULL
            ORDER BY embedding <=> ?
            LIMIT 1
            """.formatted(placeholders);

        List<Object> params = new ArrayList<>();
        params.add(new PGvector(queryEmbedding));
        params.addAll(candidateSkillIds);
        params.add(new PGvector(queryEmbedding));
        return jdbcTemplate.query(sql,
                (rs, rowNum) -> new MatchResult(
                        rs.getLong("id"),
                        rs.getString("name"),
                        rs.getDouble("similarity")
                ),
                params.toArray()
        ).stream().findFirst();
    }

    public record MatchResult(Long skillId, String name, double similarity) {}
}