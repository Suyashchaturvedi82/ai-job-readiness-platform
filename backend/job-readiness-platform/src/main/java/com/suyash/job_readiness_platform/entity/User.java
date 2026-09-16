package com.suyash.job_readiness_platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
    @Table(name = "users")

    @Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
    public class User {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;


        @Column(nullable = false, unique = true)
        private String email;

        @Column(name = "password_hash", nullable = false)
        private String passwordHash;

        @Column(name = "created_at", nullable = false, updatable = false)
        private LocalDateTime createdAt;


        @PrePersist
        void onCreate() { this.createdAt = LocalDateTime.now(); }
    }

