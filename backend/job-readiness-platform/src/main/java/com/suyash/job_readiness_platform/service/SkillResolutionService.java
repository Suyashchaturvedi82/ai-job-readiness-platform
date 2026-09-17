package com.suyash.job_readiness_platform.service;

import com.suyash.job_readiness_platform.ai.GeminiEmbeddingClient;
import com.suyash.job_readiness_platform.entity.Skill;
import com.suyash.job_readiness_platform.repository.SkillEmbeddingRepository;
import com.suyash.job_readiness_platform.repository.SkillRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SkillResolutionService {
    private final SkillRepository skillRepository;
    private final SkillEmbeddingRepository skillEmbeddingRepository;
    private final GeminiEmbeddingClient embeddingClient;

    private static final double SIMILARITY_THRESHOLD = 0.85;

    @Transactional
    public Skill resolveSkill(String rawName) {
        return skillRepository.findByNameIgnoreCase(rawName.trim())
                .orElseGet(() -> createWithEmbedding(rawName.trim()));
    }

    private Skill createWithEmbedding(String name) {
        Skill skill = skillRepository.save(Skill.builder().name(name).build());
        try {
            float[] embedding = embeddingClient.embed(name);
            skillEmbeddingRepository.saveEmbedding(skill.getId(), embedding);
        } catch (Exception e) {
            log.warn("Could not embed skill '{}', falls back to exact-name matching only", name);
        }
        return skill;
    }

    public Optional<SkillEmbeddingRepository.MatchResult> findBestSemanticMatch(
            List<Long> candidateSkillIds, String requiredSkillName) {
        try {
            float[] queryEmbedding = embeddingClient.embed(requiredSkillName);
            return skillEmbeddingRepository.findBestMatch(candidateSkillIds, queryEmbedding)
                    .filter(m -> m.similarity() >= SIMILARITY_THRESHOLD);
        } catch (Exception e) {
            log.warn("Semantic match failed, falling back to exact match only", e);
            return Optional.empty();
        }
    }
}