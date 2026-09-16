package com.suyash.job_readiness_platform.repository;

import com.suyash.job_readiness_platform.entity.AnalysisSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnalysisSkillRepository extends JpaRepository<AnalysisSkill, Long> {
    List<AnalysisSkill> findByAnalysisId(Long analysisId);
}