package com.suyash.job_readiness_platform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roadmap_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoadmapItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "analysis_id", nullable = false)
    private Analysis analysis;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    private String topic;
    @Column(name = "sequence_order", nullable = false) private Integer sequenceOrder;
    @Column(name = "estimated_effort_hours") private Integer estimatedEffortHours;
}