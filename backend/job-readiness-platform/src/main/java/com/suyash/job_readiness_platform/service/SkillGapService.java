package com.suyash.job_readiness_platform.service;

import com.suyash.job_readiness_platform.dto.ExtractedSkill;
import com.suyash.job_readiness_platform.entity.Analysis;
import com.suyash.job_readiness_platform.entity.AnalysisSkill;
import com.suyash.job_readiness_platform.entity.Skill;
import com.suyash.job_readiness_platform.entity.SkillStatus;
import com.suyash.job_readiness_platform.repository.SkillRepository;
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
                                          SkillRepository skillRepository) {
        Map<String, Double> candidateMap = toMap(candidateSkills);
        List<AnalysisSkill> results = new ArrayList<>();

        for (ExtractedSkill required : requiredSkills) {
            Skill skill = findOrCreateSkill(required.name(), skillRepository);
            Double candidateConfidence = candidateMap.get(normalize(required.name()));

            SkillStatus status;
            if (candidateConfidence == null) {
                status = SkillStatus.MISSING;
            } else if (candidateConfidence < WEAK_THRESHOLD) {
                status = SkillStatus.WEAK;
            } else {
                status = SkillStatus.STRONG;
            }

            results.add(AnalysisSkill.builder()
                    .analysis(analysis)
                    .skill(skill)
                    .status(status)
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

    private Map<String, Double> toMap(List<ExtractedSkill> skills) {
        Map<String, Double> map = new HashMap<>();
        for (ExtractedSkill s : skills) map.put(normalize(s.name()), s.confidence());
        return map;
    }

    private String normalize(String name) { return name.trim().toLowerCase(); }

    private Skill findOrCreateSkill(String name, SkillRepository repo) {
        return repo.findByNameIgnoreCase(name)
                .orElseGet(() -> repo.save(Skill.builder().name(name).build()));
    }
}
