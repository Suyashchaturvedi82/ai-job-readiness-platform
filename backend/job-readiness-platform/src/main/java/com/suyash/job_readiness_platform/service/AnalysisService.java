package com.suyash.job_readiness_platform.service;

import com.suyash.job_readiness_platform.dto.AnalysisResponse;
import com.suyash.job_readiness_platform.dto.ExtractedSkill;
import com.suyash.job_readiness_platform.dto.SkillBreakdown;
import com.suyash.job_readiness_platform.entity.Analysis;
import com.suyash.job_readiness_platform.entity.AnalysisSkill;
import com.suyash.job_readiness_platform.entity.JobDescription;
import com.suyash.job_readiness_platform.entity.Resume;
import com.suyash.job_readiness_platform.exception.ResourceNotFoundException;
import com.suyash.job_readiness_platform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalysisService {
    private final ResumeRepository resumeRepository;
    private final JobDescriptionRepository jdRepository;
    private final AnalysisRepository analysisRepository;
    private final AnalysisSkillRepository analysisSkillRepository;
    private final SkillExtractionService skillExtractionService;
    private final SkillGapService skillGapService;
    private final SkillRepository skillRepository;

    public AnalysisResponse createAnalysis(String userEmail, Long resumeId, Long jobDescriptionId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));
        JobDescription jd = jdRepository.findById(jobDescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Job description not found"));

        if (!resume.getUser().getEmail().equals(userEmail) || !jd.getUser().getEmail().equals(userEmail)) {
            throw new AccessDeniedException("You don't own this resume or job description");
        }

        List<ExtractedSkill> candidateSkills = skillExtractionService.extractSkills(resume.getRawText(), "RESUME");
        List<ExtractedSkill> requiredSkills = skillExtractionService.extractSkills(jd.getRawText(), "JD");

        Analysis analysis = Analysis.builder()
                .user(resume.getUser()).resume(resume).jobDescription(jd).build();
        analysisRepository.save(analysis);

        List<AnalysisSkill> gaps = skillGapService.computeGap(analysis, candidateSkills, requiredSkills, skillRepository);
        analysisSkillRepository.saveAll(gaps);

        double score = skillGapService.computeReadinessScore(gaps);
        analysis.setReadinessScore(score);
        analysisRepository.save(analysis);

        return toResponse(analysis, gaps);
    }

    private AnalysisResponse toResponse(Analysis analysis, List<AnalysisSkill> gaps) {
        List<SkillBreakdown> breakdown = gaps.stream()
                .map(g -> new SkillBreakdown(g.getSkill().getName(), g.getStatus().name(), g.getPriority()))
                .toList();
        return new AnalysisResponse(analysis.getId(), analysis.getReadinessScore(), breakdown);
    }
}