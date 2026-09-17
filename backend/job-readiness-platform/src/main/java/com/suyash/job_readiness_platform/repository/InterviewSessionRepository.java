package com.suyash.job_readiness_platform.repository;

import com.suyash.job_readiness_platform.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {

    @Query("SELECT i FROM InterviewSession i WHERE i.id = :id AND i.userEmail = :userEmail")
    Optional<InterviewSession> findByIdAndUserEmail(@Param("id") Long id, @Param("userEmail") String userEmail);

}