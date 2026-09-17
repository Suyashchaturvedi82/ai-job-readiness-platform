package com.suyash.job_readiness_platform.controller;

import com.suyash.job_readiness_platform.dto.AnalysisResponse;
import com.suyash.job_readiness_platform.dto.CreateAnalysisRequest;
import com.suyash.job_readiness_platform.dto.RoadmapItemResponse;
import com.suyash.job_readiness_platform.service.AnalysisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analyses")
@RequiredArgsConstructor
public class AnalysisController {
    private final AnalysisService analysisService;

    @PostMapping
    public ResponseEntity<AnalysisResponse> create(@Valid @RequestBody CreateAnalysisRequest request, Authentication auth) {
        return ResponseEntity.ok(analysisService.createAnalysis(auth.getName(), request.resumeId(), request.jobDescriptionId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnalysisResponse> get(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(analysisService.getAnalysis(auth.getName(), id));
    }

    @PostMapping("/{id}/roadmap")
    public ResponseEntity<List<RoadmapItemResponse>> roadmap(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(analysisService.generateRoadmap(auth.getName(), id));
    }
}