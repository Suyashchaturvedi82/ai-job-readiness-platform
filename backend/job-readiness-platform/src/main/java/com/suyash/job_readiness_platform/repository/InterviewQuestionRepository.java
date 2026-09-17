package com.suyash.job_readiness_platform.repository;

import com.suyash.job_readiness_platform.entity.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {
    List<InterviewQuestion> findBySessionIdOrderBySequenceOrderAsc(Long sessionId);
}