package com.suyash.job_readiness_platform.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.suyash.job_readiness_platform.ai.GeminiClient;
import com.suyash.job_readiness_platform.dto.ExtractedSkill;
import com.suyash.job_readiness_platform.exception.AiResponseParseException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SkillExtractionService {

    private final GeminiClient geminiClient;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    private static final Duration CACHE_TTL = Duration.ofDays(7);

    public List<ExtractedSkill> extractSkills(String text, String sourceType) {
        String cacheKey = "skills:" + sourceType + ":" + sha256(text);

        String cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            log.info("Cache hit for {} skill extraction", sourceType);
            return parseSkills(cached);
        }

        log.info("Cache miss — calling Gemini for {} skill extraction", sourceType);
        String prompt = buildPrompt(text, sourceType);
        String json = geminiClient.generateJson(prompt, skillExtractionSchema());
        redisTemplate.opsForValue().set(cacheKey, json, CACHE_TTL);
        return parseSkills(json);
    }

    private Map<String, Object> skillExtractionSchema() {
        return Map.of(
                "type", "OBJECT",
                "properties", Map.of(
                        "skills", Map.of(
                                "type", "ARRAY",
                                "items", Map.of(
                                        "type", "OBJECT",
                                        "properties", Map.of(
                                                "name", Map.of("type", "STRING"),
                                                "confidence", Map.of("type", "NUMBER")
                                        ),
                                        "required", List.of("name", "confidence")
                                )
                        )
                ),
                "required", List.of("skills")
        );
    }

    private String buildPrompt(String text, String sourceType) {
        if ("RESUME".equals(sourceType)) {
            return """
                Extract the technical skills this candidate actually has, based on their resume.
                Give a confidence score (0.0 to 1.0): higher if the resume shows real project usage,
                lower if just mentioned once.
                Resume text:
                %s
                """.formatted(text);
        }
        return """
            Extract the technical skills required or preferred for this job, based on the job
            description. Confidence = how essential the skill is (1.0 = explicitly required,
            0.5 = nice-to-have).
            Job description text:
            %s
            """.formatted(text);
    }

    private List<ExtractedSkill> parseSkills(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            List<ExtractedSkill> result = new ArrayList<>();
            for (JsonNode node : root.get("skills")) {
                result.add(new ExtractedSkill(node.get("name").asText(), node.get("confidence").asDouble()));
            }
            return result;
        } catch (Exception e) {
            log.error("Failed to parse Gemini skill response", e);
            throw new AiResponseParseException("Could not parse AI skill extraction");
        }
    }

    private String sha256(String text) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(text.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
}