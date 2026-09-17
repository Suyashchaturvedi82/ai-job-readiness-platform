package com.suyash.job_readiness_platform.repository;


import com.suyash.job_readiness_platform.entity.InterviewAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface InterviewAnswerRepository extends JpaRepository<InterviewAnswer, Long> {
    Optional<InterviewAnswer> findByQuestionId(Long questionId);
}