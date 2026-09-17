package com.suyash.job_readiness_platform.service;
import com.suyash.job_readiness_platform.dto.ExtractedSkill;
import com.suyash.job_readiness_platform.entity.Analysis;
import com.suyash.job_readiness_platform.entity.AnalysisSkill;
import com.suyash.job_readiness_platform.entity.Skill;
import com.suyash.job_readiness_platform.entity.SkillStatus;
import com.suyash.job_readiness_platform.service.SkillResolutionService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SkillGapService {

    private static final double WEAK_THRESHOLD = 0.5;

    public List<AnalysisSkill> computeGap(Analysis analysis,
                                          List<ExtractedSkill> candidateSkills,
                                          List<ExtractedSkill> requiredSkills,
                                          SkillResolutionService skillResolution) {

        Map<Long, Double> candidateConfidenceById = new HashMap<>();
        for (ExtractedSkill c : candidateSkills) {
            Skill skill = skillResolution.resolveSkill(c.name());
            candidateConfidenceById.put(skill.getId(), c.confidence());
        }
        List<Long> candidateIds = new ArrayList<>(candidateConfidenceById.keySet());

        List<AnalysisSkill> results = new ArrayList<>();
        for (ExtractedSkill required : requiredSkills) {
            Skill requiredSkill = skillResolution.resolveSkill(required.name());
            Double matchedConfidence = candidateConfidenceById.get(requiredSkill.getId()); // exact match, free

            if (matchedConfidence == null) {
                // Fallback only when exact match fails — e.g. "React" vs "ReactJS"
                var semanticMatch = skillResolution.findBestSemanticMatch(candidateIds, required.name());
                if (semanticMatch.isPresent()) {
                    matchedConfidence = candidateConfidenceById.get(semanticMatch.get().skillId());
                }
            }

            SkillStatus status = matchedConfidence == null ? SkillStatus.MISSING
                    : matchedConfidence < WEAK_THRESHOLD ? SkillStatus.WEAK : SkillStatus.STRONG;

            results.add(AnalysisSkill.builder()
                    .analysis(analysis).skill(requiredSkill).status(status)
                    .priority((int) Math.round(required.confidence() * 10))
                    .build());
        }
        return results;
    }

    public double computeReadinessScore(List<AnalysisSkill> gaps) {
        if (gaps.isEmpty()) return 0.0;
        double totalWeight = gaps.stream().mapToDouble(AnalysisSkill::getPriority).sum();
        double earnedWeight = gaps.stream()
                .filter(g -> g.getStatus() != SkillStatus.MISSING)
                .mapToDouble(g -> g.getStatus() == SkillStatus.STRONG ? g.getPriority() : g.getPriority() * 0.5)
                .sum();
        return totalWeight == 0 ? 0.0 : Math.round((earnedWeight / totalWeight) * 1000) / 10.0;
    }
}