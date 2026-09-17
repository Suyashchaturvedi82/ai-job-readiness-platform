package com.suyash.job_readiness_platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "question_id", nullable = false, unique = true) private InterviewQuestion question;
    @Column(name = "answer_text", nullable = false, columnDefinition = "TEXT") private String answerText;
    @Column(name = "submitted_at", nullable = false, updatable = false) private LocalDateTime submittedAt;
    @PrePersist void onCreate() { this.submittedAt = LocalDateTime.now(); }
}