package com.suyash.job_readiness_platform.controller;

import com.suyash.job_readiness_platform.dto.ResumeResponse;
import com.suyash.job_readiness_platform.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {
    private final ResumeService resumeService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResumeResponse> upload(@RequestParam("file") MultipartFile file,
                                                 Authentication authentication) {
        return ResponseEntity.ok(resumeService.uploadResume(authentication.getName(), file));
    }
    @GetMapping
    public ResponseEntity<List<ResumeResponse>> list(Authentication auth) {
        return ResponseEntity.ok(resumeService.listMine(auth.getName()));
    }
}
