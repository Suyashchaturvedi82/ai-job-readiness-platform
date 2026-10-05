package com.suyash.job_readiness_platform.dto;

import java.time.LocalDateTime;

public record AnalysisSummary(Long analysisId, double readinessScore, String jobTitle, String resumeName, LocalDateTime createdAt) {}
