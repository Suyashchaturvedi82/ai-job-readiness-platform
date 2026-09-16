package com.suyash.job_readiness_platform.dto;

import com.drew.lang.annotations.NotNull;

public record CreateAnalysisRequest(@NotNull Long resumeId, @NotNull Long jobDescriptionId) {}