package com.suyash.job_readiness_platform.controller;

import com.suyash.job_readiness_platform.dto.CreateJdRequest;
import com.suyash.job_readiness_platform.dto.JobDescriptionResponse;
import com.suyash.job_readiness_platform.service.JobDescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/job-descriptions")
@RequiredArgsConstructor
public class JobDescriptionController {
    private final JobDescriptionService jdService;

    @PostMapping
    public ResponseEntity<JobDescriptionResponse> create(@Valid @RequestBody CreateJdRequest request,
                                                         Authentication authentication) {
        return ResponseEntity.ok(jdService.create(authentication.getName(), request));
    }
}