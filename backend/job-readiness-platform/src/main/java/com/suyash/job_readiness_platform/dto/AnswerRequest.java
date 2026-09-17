package com.suyash.job_readiness_platform.dto;

import jakarta.validation.constraints.NotBlank;

public record AnswerRequest(@NotBlank String answerText) {
}