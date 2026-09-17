package com.suyash.job_readiness_platform.controller;

import com.suyash.job_readiness_platform.dto.AnswerRequest;
import com.suyash.job_readiness_platform.dto.EvaluationResponse;
import com.suyash.job_readiness_platform.dto.InterviewSessionResponse;
import com.suyash.job_readiness_platform.dto.QuestionResponse;
import com.suyash.job_readiness_platform.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interview-sessions")
@RequiredArgsConstructor
public class InterviewController {
    private final InterviewService interviewService;

    @PostMapping
    public ResponseEntity<InterviewSessionResponse> start(@RequestParam Long analysisId, Authentication auth) {
        return ResponseEntity.ok(interviewService.startSession(auth.getName(), analysisId));
    }

    @PostMapping("/{id}/questions/next")
    public ResponseEntity<QuestionResponse> next(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(interviewService.nextQuestion(auth.getName(), id));
    }

    @PostMapping("/questions/{questionId}/answers")
    public ResponseEntity<EvaluationResponse> answer(@PathVariable Long questionId,
                                                     @RequestBody @Valid AnswerRequest request, Authentication auth) {
        return ResponseEntity.ok(interviewService.submitAnswer(auth.getName(), questionId, request.answerText()));
    }
}