package com.suyash.job_readiness_platform.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.suyash.job_readiness_platform.ai.GeminiClient;
import com.suyash.job_readiness_platform.entity.*;
import com.suyash.job_readiness_platform.exception.AiResponseParseException;
import com.suyash.job_readiness_platform.repository.RoadmapItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoadmapService {
    private final GeminiClient geminiClient;
    private final RoadmapItemRepository roadmapItemRepository;
    private final ObjectMapper objectMapper;

    public List<RoadmapItem> generateRoadmap(Analysis analysis, List<AnalysisSkill> gaps) {
        List<AnalysisSkill> needsWork = gaps.stream()
                .filter(g -> g.getStatus() != SkillStatus.STRONG)
                .sorted(Comparator.comparingInt(AnalysisSkill::getPriority).reversed())
                .toList();
        if (needsWork.isEmpty()) return List.of();

        String prompt = buildPrompt(needsWork);
        String json = geminiClient.generateJson(prompt, schema());
        return roadmapItemRepository.saveAll(parse(json, analysis, needsWork));
    }

    private String buildPrompt(List<AnalysisSkill> needsWork) {
        String skillList = needsWork.stream()
                .map(g -> "- %s (currently %s)".formatted(g.getSkill().getName(), g.getStatus()))
                .collect(Collectors.joining("\n"));
        return """
            A candidate is preparing for a job interview. Skill gaps, ordered by importance:
            %s
            For each skill give ONE short study topic (one sentence) and estimated hours
            (1-20) to get interview-ready, assuming general programming knowledge already.
            """.formatted(skillList);
    }

    private Map<String, Object> schema() {
        return Map.of("type", "OBJECT", "properties", Map.of(
                "items", Map.of("type", "ARRAY", "items", Map.of(
                        "type", "OBJECT", "properties", Map.of(
                                "skillName", Map.of("type", "STRING"),
                                "topic", Map.of("type", "STRING"),
                                "estimatedHours", Map.of("type", "INTEGER")
                        ), "required", List.of("skillName", "topic", "estimatedHours")
                ))
        ), "required", List.of("items"));
    }

    private List<RoadmapItem> parse(String json, Analysis analysis, List<AnalysisSkill> needsWork) {
        try {
            JsonNode root = objectMapper.readTree(json);
            Map<String, Skill> skillByName = needsWork.stream()
                    .collect(Collectors.toMap(g -> g.getSkill().getName(), AnalysisSkill::getSkill, (a, b) -> a));
            List<RoadmapItem> result = new ArrayList<>();
            int order = 1;
            for (JsonNode node : root.get("items")) {
                Skill skill = skillByName.get(node.get("skillName").asText());
                if (skill == null) continue; // Gemini renamed something — skip, don't crash
                result.add(RoadmapItem.builder()
                        .analysis(analysis).skill(skill)
                        .topic(node.get("topic").asText())
                        .sequenceOrder(order++)
                        .estimatedEffortHours(node.get("estimatedHours").asInt())
                        .build());
            }
            return result;
        } catch (Exception e) {
            log.error("Failed to parse roadmap", e);
            throw new AiResponseParseException("Could not generate roadmap");
        }
    }
}
