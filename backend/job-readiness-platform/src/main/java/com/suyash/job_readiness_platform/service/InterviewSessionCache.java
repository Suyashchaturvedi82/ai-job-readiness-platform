package com.suyash.job_readiness_platform.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.suyash.job_readiness_platform.ai.InterviewContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InterviewSessionCache {
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private static final Duration TTL = Duration.ofHours(2);

    public void save(Long sessionId, InterviewContext context) {
        try {
            redisTemplate.opsForValue().set("interview-session:" + sessionId,
                    objectMapper.writeValueAsString(context), TTL);
        } catch (JsonProcessingException e) { throw new RuntimeException(e); }
    }

    public Optional<InterviewContext> get(Long sessionId) {
        String json = redisTemplate.opsForValue().get("interview-session:" + sessionId);
        if (json == null) return Optional.empty();
        try { return Optional.of(objectMapper.readValue(json, InterviewContext.class)); }
        catch (JsonProcessingException e) { return Optional.empty(); }
    }
}