package com.suyash.job_readiness_platform.repository;

import com.suyash.job_readiness_platform.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResumeRepository extends JpaRepository<Resume, Long> { }
