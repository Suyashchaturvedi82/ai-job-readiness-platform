package com.suyash.job_readiness_platform.repository;

import com.suyash.job_readiness_platform.entity.Evaluation; // Agar entity ka naam sirf Evaluation hai, toh yahan change kar lena
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
}