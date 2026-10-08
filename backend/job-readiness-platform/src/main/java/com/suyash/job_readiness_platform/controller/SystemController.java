package com.suyash.job_readiness_platform.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class SystemController {

    @Value("${gemini.model:gemini-flash-latest}")
    private String geminiModel;

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        // Never expose the key itself — only whether one was loaded from .env/env vars.
        boolean keyLoaded = geminiApiKey != null && !geminiApiKey.isBlank();
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "service", "ai-job-readiness-platform",
                "aiModel", geminiModel,
                "aiKeyConfigured", String.valueOf(keyLoaded)));
    }
}
