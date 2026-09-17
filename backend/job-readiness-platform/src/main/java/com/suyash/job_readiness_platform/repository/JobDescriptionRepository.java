package com.suyash.job_readiness_platform.repository;

import com.suyash.job_readiness_platform.entity.JobDescription;
import com.suyash.job_readiness_platform.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobDescriptionRepository extends JpaRepository<JobDescription, Long> {
    List<JobDescription> findByUserEmailOrderByCreatedAtDesc(String email);
}
