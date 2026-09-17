package com.suyash.job_readiness_platform.ai;

import com.suyash.job_readiness_platform.exception.AiServiceUnavailableException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Component
public class GeminiEmbeddingClient {
    private final WebClient webClient;
    private static final String MODEL = "gemini-embedding-001";
    private static final int DIMENSIONS = 768;

    @Value("${gemini.api-key}")
    private String apiKey;

    public GeminiEmbeddingClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://generativelanguage.googleapis.com/v1beta").build();
    }

    @SuppressWarnings("unchecked")
    public float[] embed(String text) {
        try {
            Map<String, Object> body = Map.of(
                    "content", Map.of("parts", List.of(Map.of("text", text))),
                    "outputDimensionality", DIMENSIONS
            );
            Map<String, Object> response = webClient.post()
                    .uri("/models/{model}:embedContent", MODEL)
                    .header("x-goog-api-key", apiKey)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(15))
                    .block();

            Map<String, Object> embedding = (Map<String, Object>) response.get("embedding");
            List<Double> values = (List<Double>) embedding.get("values");
            float[] result = new float[values.size()];
            for (int i = 0; i < values.size(); i++) result[i] = values.get(i).floatValue();
            return result;
        } catch (Exception e) {
            throw new AiServiceUnavailableException("Could not generate embedding", e);
        }
    }
}