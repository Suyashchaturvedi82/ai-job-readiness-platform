package com.suyash.job_readiness_platform.entity;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "session_id", nullable = false) private InterviewSession session;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "skill_id") private Skill skill;
    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT") private String questionText;
    private String difficulty;
    @Column(name = "sequence_order", nullable = false) private Integer sequenceOrder;
}