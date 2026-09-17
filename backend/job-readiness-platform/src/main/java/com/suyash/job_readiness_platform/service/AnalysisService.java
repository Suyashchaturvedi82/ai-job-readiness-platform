package com.suyash.job_readiness_platform.service;

import com.suyash.job_readiness_platform.dto.AnalysisResponse;
import com.suyash.job_readiness_platform.dto.ExtractedSkill;
import com.suyash.job_readiness_platform.dto.RoadmapItemResponse;
import com.suyash.job_readiness_platform.entity.JobDescription;
import com.suyash.job_readiness_platform.entity.Resume;
import com.suyash.job_readiness_platform.exception.ResourceNotFoundException;
import com.suyash.job_readiness_platform.repository.JobDescriptionRepository;
import com.suyash.job_readiness_platform.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalysisService {
    private final ResumeRepository resumeRepository;
    private final JobDescriptionRepository jdRepository;
    private final SkillExtractionService skillExtractionService;
    private final AnalysisPersistenceService persistenceService;

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

        // Delegating to a DIFFERENT bean so @Transactional actually applies —
        // calling a @Transactional method on `this` bypasses Spring's proxy.
        return persistenceService.persistAnalysis(resume, jd, candidateSkills, requiredSkills);
    }

    public AnalysisResponse getAnalysis(String userEmail, Long analysisId) {
        return persistenceService.getAnalysis(userEmail, analysisId);
    }

    public List<RoadmapItemResponse> generateRoadmap(String userEmail, Long analysisId) {
        return persistenceService.generateRoadmap(userEmail, analysisId);
    }
}