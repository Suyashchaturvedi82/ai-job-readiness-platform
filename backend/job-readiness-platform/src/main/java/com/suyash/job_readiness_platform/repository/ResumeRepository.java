package com.suyash.job_readiness_platform.repository;

import com.suyash.job_readiness_platform.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByUserEmailOrderByUploadedAtDesc(String email);
}
