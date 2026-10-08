package com.suyash.job_readiness_platform.ai;

import com.suyash.job_readiness_platform.exception.AiServiceUnavailableException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class GeminiClient {

    private static final int MAX_ATTEMPTS = 3;
    private final WebClient webClient;

    @Value("${gemini.api-key}")
    private String apiKey;

    @Value("${gemini.models:gemini-flash-latest}")
    private String modelsCsv;

    public GeminiClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://generativelanguage.googleapis.com/v1beta").build();
    }

    public String generateJson(String prompt, Map<String, Object> responseSchema) {
        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                "generationConfig", Map.of(
                        "responseMimeType", "application/json",
                        "responseSchema", responseSchema,
                        "temperature", 0.2));

        Exception last = null;
        for (String model : modelsCsv.split(",")) {
            String m = model.trim();
            for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
                try {
                    return call(m, body);
                } catch (WebClientResponseException e) {
                    int status = e.getStatusCode().value();
                    log.warn("Gemini model={} attempt {}/{} -> HTTP {}", m, attempt, MAX_ATTEMPTS, status);
                    last = e;
                    if (status == 400 || status == 401 || status == 403) {
                        throw new AiServiceUnavailableException(
                                "Gemini rejected the request (HTTP " + status + ") - check API key / request", e);
                    }
                    if (status == 404) break;      // wrong model name -> try next model
                    sleep(attempt * 2000L);        // 429 / 5xx -> backoff, retry
                } catch (Exception e) {
                    log.warn("Gemini model={} attempt {}/{} -> {}", m, attempt, MAX_ATTEMPTS, e.toString());
                    last = e;
                    sleep(attempt * 2000L);
                }
            }
        }
        throw new AiServiceUnavailableException("Gemini is busy right now - please try again in a minute", last);
    }

    @SuppressWarnings("unchecked")
    private String call(String model, Map<String, Object> body) {
        Map<String, Object> res = webClient.post()
                .uri("/models/{model}:generateContent", model)
                .header("x-goog-api-key", apiKey)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(Duration.ofSeconds(45))
                .block();
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) res.get("candidates");
        if (candidates == null || candidates.isEmpty()) {
            throw new IllegalStateException("Gemini returned no candidates");
        }
        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        return (String) parts.get(0).get("text");
    }

    private void sleep(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
    }
}