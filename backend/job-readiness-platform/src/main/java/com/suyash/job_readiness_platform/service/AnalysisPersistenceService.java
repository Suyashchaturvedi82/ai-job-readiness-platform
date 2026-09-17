package com.suyash.job_readiness_platform.service;

import com.suyash.job_readiness_platform.dto.AnalysisResponse;
import com.suyash.job_readiness_platform.dto.ExtractedSkill;
import com.suyash.job_readiness_platform.dto.RoadmapItemResponse;
import com.suyash.job_readiness_platform.dto.SkillBreakdown;
import com.suyash.job_readiness_platform.entity.Analysis;
import com.suyash.job_readiness_platform.entity.AnalysisSkill;
import com.suyash.job_readiness_platform.entity.JobDescription;
import com.suyash.job_readiness_platform.entity.Resume;
import com.suyash.job_readiness_platform.exception.ResourceNotFoundException;
import com.suyash.job_readiness_platform.repository.AnalysisRepository;
import com.suyash.job_readiness_platform.repository.AnalysisSkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalysisPersistenceService {
    private final AnalysisRepository analysisRepository;
    private final AnalysisSkillRepository analysisSkillRepository;
    private final SkillGapService skillGapService;
    private final SkillResolutionService skillResolutionService;
    private final RoadmapService roadmapService;

    @Transactional
    public AnalysisResponse persistAnalysis(Resume resume, JobDescription jd,
                                            List<ExtractedSkill> candidateSkills,
                                            List<ExtractedSkill> requiredSkills) {
        Analysis analysis = Analysis.builder()
                .user(resume.getUser()).resume(resume).jobDescription(jd).build();
        analysisRepository.save(analysis);

        List<AnalysisSkill> gaps = skillGapService.computeGap(analysis, candidateSkills, requiredSkills, skillResolutionService);
        analysisSkillRepository.saveAll(gaps);

        analysis.setReadinessScore(skillGapService.computeReadinessScore(gaps));
        analysisRepository.save(analysis);
        return toResponse(analysis, gaps);
    }

    @Transactional(readOnly = true)
    public AnalysisResponse getAnalysis(String userEmail, Long analysisId) {
        Analysis analysis = findOwned(userEmail, analysisId);
        return toResponse(analysis, analysisSkillRepository.findByAnalysisId(analysisId));
    }

    @Transactional
    public List<RoadmapItemResponse> generateRoadmap(String userEmail, Long analysisId) {
        Analysis analysis = findOwned(userEmail, analysisId);
        List<AnalysisSkill> gaps = analysisSkillRepository.findByAnalysisId(analysisId);
        return roadmapService.generateRoadmap(analysis, gaps).stream()
                .map(i -> new RoadmapItemResponse(i.getSkill().getName(), i.getTopic(), i.getSequenceOrder(), i.getEstimatedEffortHours()))
                .toList();
    }

    private Analysis findOwned(String userEmail, Long analysisId) {
        Analysis analysis = analysisRepository.findById(analysisId)
                .orElseThrow(() -> new ResourceNotFoundException("Analysis not found"));
        if (!analysis.getUser().getEmail().equals(userEmail)) throw new AccessDeniedException("Not your analysis");
        return analysis;
    }

    private AnalysisResponse toResponse(Analysis analysis, List<AnalysisSkill> gaps) {
        List<SkillBreakdown> breakdown = gaps.stream()
                .map(g -> new SkillBreakdown(g.getSkill().getName(), g.getStatus().name(), g.getPriority()))
                .toList();
        return new AnalysisResponse(analysis.getId(), analysis.getReadinessScore(), breakdown);
    }
}