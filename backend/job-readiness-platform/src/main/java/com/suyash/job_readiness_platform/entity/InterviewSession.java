package com.suyash.job_readiness_platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "analysis_id", nullable = false) private Analysis analysis;
    private String status;
    @Column(name = "started_at", nullable = false, updatable = false) private LocalDateTime startedAt;
    @Column(name = "completed_at") private LocalDateTime completedAt;
    @PrePersist void onCreate() { this.startedAt = LocalDateTime.now(); }
    @Column(name = "user_email")
    private String userEmail;

}