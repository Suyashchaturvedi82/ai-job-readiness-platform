package com.suyash.job_readiness_platform.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateJdRequest(String title, String company, @NotBlank String rawText) {}