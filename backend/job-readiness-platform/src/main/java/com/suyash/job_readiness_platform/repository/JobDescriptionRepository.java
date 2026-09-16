package com.suyash.job_readiness_platform.repository;

import com.suyash.job_readiness_platform.entity.JobDescription;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobDescriptionRepository extends JpaRepository<JobDescription, Long> {}
