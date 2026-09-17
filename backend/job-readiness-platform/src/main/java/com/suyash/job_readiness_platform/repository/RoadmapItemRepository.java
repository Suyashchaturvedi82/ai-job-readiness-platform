package com.suyash.job_readiness_platform.repository;

import com.suyash.job_readiness_platform.entity.RoadmapItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoadmapItemRepository extends JpaRepository<RoadmapItem, Long> {
    List<RoadmapItem> findByAnalysisIdOrderBySequenceOrder(Long analysisId);
}