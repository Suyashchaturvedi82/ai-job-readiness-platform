package com.suyash.job_readiness_platform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "evaluations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Evaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "answer_id", nullable = false, unique = true) private InterviewAnswer answer;
    private Integer score;
    @Column(columnDefinition = "TEXT") private String feedback;
    @Column(name = "weak_area_flag", nullable = false) private boolean weakAreaFlag;
}
