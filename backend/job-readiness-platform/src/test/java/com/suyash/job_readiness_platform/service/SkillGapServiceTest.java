package com.suyash.job_readiness_platform.service;

import com.suyash.job_readiness_platform.entity.AnalysisSkill;
import com.suyash.job_readiness_platform.entity.SkillStatus;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SkillGapServiceTest {

    private final SkillGapService service = new SkillGapService();

    @Test
    void readinessScore_isFull_whenAllSkillsStrong() {
        AnalysisSkill s1 = AnalysisSkill.builder().status(SkillStatus.STRONG).priority(1).build();
        AnalysisSkill s2 = AnalysisSkill.builder().status(SkillStatus.STRONG).priority(1).build();
        assertEquals(100.0, service.computeReadinessScore(List.of(s1, s2)));
    }

    @Test
    void readinessScore_isZero_whenAllSkillsMissing() {
        AnalysisSkill s1 = AnalysisSkill.builder().status(SkillStatus.MISSING).priority(1).build();
        assertEquals(0.0, service.computeReadinessScore(List.of(s1)));
    }
}