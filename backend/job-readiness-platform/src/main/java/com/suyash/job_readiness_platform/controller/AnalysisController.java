package com.suyash.job_readiness_platform.controller;

import com.suyash.job_readiness_platform.dto.AnalysisResponse;
import com.suyash.job_readiness_platform.dto.CreateAnalysisRequest;
import com.suyash.job_readiness_platform.service.AnalysisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analyses")
@RequiredArgsConstructor
public class AnalysisController {
    private final AnalysisService analysisService;

    @PostMapping
    public ResponseEntity<AnalysisResponse> create(@Valid @RequestBody CreateAnalysisRequest request,
                                                   Authentication authentication) {
        return ResponseEntity.ok(analysisService.createAnalysis(
                authentication.getName(), request.resumeId(), request.jobDescriptionId()));
    }
}