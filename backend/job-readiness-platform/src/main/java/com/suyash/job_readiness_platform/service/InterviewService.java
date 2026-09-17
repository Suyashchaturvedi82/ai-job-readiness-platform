package com.suyash.job_readiness_platform.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.suyash.job_readiness_platform.ai.GeminiClient;
import com.suyash.job_readiness_platform.ai.InterviewContext;
import com.suyash.job_readiness_platform.dto.EvaluationResponse;
import com.suyash.job_readiness_platform.dto.InterviewSessionResponse;
import com.suyash.job_readiness_platform.dto.QuestionResponse;
import com.suyash.job_readiness_platform.entity.*;
import com.suyash.job_readiness_platform.exception.AiResponseParseException;
import com.suyash.job_readiness_platform.exception.ResourceNotFoundException;
import com.suyash.job_readiness_platform.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InterviewService {
    private final InterviewSessionRepository sessionRepository;
    private final InterviewQuestionRepository questionRepository;
    private final InterviewAnswerRepository answerRepository;
    private final EvaluationRepository evaluationRepository;
    private final AnalysisRepository analysisRepository;
    private final AnalysisSkillRepository analysisSkillRepository;
    private final InterviewSessionCache sessionCache;
    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public InterviewSessionResponse startSession(String userEmail, Long analysisId) {
        Analysis analysis = analysisRepository.findById(analysisId)
                .orElseThrow(() -> new ResourceNotFoundException("Analysis not found"));
        if (!analysis.getUser().getEmail().equals(userEmail)) throw new AccessDeniedException("Not your analysis");

        InterviewSession session = InterviewSession.builder().analysis(analysis).status("IN_PROGRESS").build();
        sessionRepository.save(session);

        InterviewContext context = new InterviewContext();
        context.resumeText = analysis.getResume().getRawText();
        context.jdText = analysis.getJobDescription().getRawText();
        context.weakSkillNames = analysisSkillRepository.findByAnalysisId(analysisId).stream()
                .filter(g -> g.getStatus() != SkillStatus.STRONG).map(g -> g.getSkill().getName()).toList();
        sessionCache.save(session.getId(), context);

        return new InterviewSessionResponse(session.getId(), session.getStatus());
    }

    @Transactional
    public QuestionResponse nextQuestion(String userEmail, Long sessionId) {
        InterviewSession session = validateOwnership(userEmail, sessionId);
        InterviewContext context = sessionCache.get(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview session expired, please restart"));

        String json = geminiClient.generateJson(buildQuestionPrompt(context), questionSchema());
        QuestionDraft draft = parseQuestion(json);

        InterviewQuestion question = InterviewQuestion.builder()
                .session(session).questionText(draft.text()).difficulty(draft.difficulty())
                .sequenceOrder(context.askedQuestions.size() + 1).build();
        questionRepository.save(question);

        context.askedQuestions.add(draft.text());
        sessionCache.save(sessionId, context);
        return new QuestionResponse(question.getId(), question.getQuestionText(), question.getDifficulty());
    }

    @Transactional
    public EvaluationResponse submitAnswer(String userEmail, Long questionId, String answerText) {
        InterviewQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        InterviewSession session = validateOwnership(userEmail, question.getSession().getId());

        InterviewAnswer answer = answerRepository.save(
                InterviewAnswer.builder().question(question).answerText(answerText).build());

        String json = geminiClient.generateJson(buildEvaluationPrompt(question.getQuestionText(), answerText), evaluationSchema());
        EvaluationDraft draft = parseEvaluation(json);

        evaluationRepository.save(Evaluation.builder()
                .answer(answer).score(draft.score()).feedback(draft.feedback())
                .weakAreaFlag(draft.score() < 6).build());

        InterviewContext context = sessionCache.get(session.getId()).orElse(new InterviewContext());
        context.answers.add(answerText);
        sessionCache.save(session.getId(), context);
        return new EvaluationResponse(draft.score(), draft.feedback());
    }

    private InterviewSession validateOwnership(String userEmail, Long sessionId) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
        if (!session.getAnalysis().getUser().getEmail().equals(userEmail))
            throw new AccessDeniedException("Not your interview session");
        return session;
    }

    private String buildQuestionPrompt(InterviewContext ctx) {
        return """
            You are interviewing a candidate. Weak/missing skills to probe: %s.
            Resume context: %s
            Job description context: %s
            Already asked: %s
            Ask ONE new question, not repeating earlier ones, targeting a weak skill where
            possible. Mark difficulty EASY, MEDIUM, or HARD.
            """.formatted(ctx.weakSkillNames, ctx.resumeText, ctx.jdText, ctx.askedQuestions);
    }
    private Map<String, Object> questionSchema() {
        return Map.of("type", "OBJECT", "properties", Map.of(
                "questionText", Map.of("type", "STRING"), "difficulty", Map.of("type", "STRING")
        ), "required", List.of("questionText", "difficulty"));
    }
    private String buildEvaluationPrompt(String question, String answer) {
        return """
            Question: %s
            Candidate's answer: %s
            Score 0-10 and give one sentence of specific, constructive feedback.
            """.formatted(question, answer);
    }
    private Map<String, Object> evaluationSchema() {
        return Map.of("type", "OBJECT", "properties", Map.of(
                "score", Map.of("type", "INTEGER"), "feedback", Map.of("type", "STRING")
        ), "required", List.of("score", "feedback"));
    }
    private record QuestionDraft(String text, String difficulty) {}
    private record EvaluationDraft(int score, String feedback) {}
    private QuestionDraft parseQuestion(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            return new QuestionDraft(root.get("questionText").asText(), root.get("difficulty").asText());
        } catch (Exception e) { throw new AiResponseParseException("Could not generate question"); }
    }
    private EvaluationDraft parseEvaluation(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            return new EvaluationDraft(root.get("score").asInt(), root.get("feedback").asText());
        } catch (Exception e) { throw new AiResponseParseException("Could not evaluate answer"); }
    }
}