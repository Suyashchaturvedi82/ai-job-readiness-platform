package com.suyash.job_readiness_platform.dto;

import java.util.List;

public record AnalysisResponse(Long analysisId, double readinessScore, List<SkillBreakdown> skills) {}
