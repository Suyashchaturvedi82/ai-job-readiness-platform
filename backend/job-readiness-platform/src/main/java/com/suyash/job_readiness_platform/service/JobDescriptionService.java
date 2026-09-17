package com.suyash.job_readiness_platform.service;

import com.suyash.job_readiness_platform.dto.CreateJdRequest;
import com.suyash.job_readiness_platform.dto.JobDescriptionResponse;
import com.suyash.job_readiness_platform.entity.JobDescription;
import com.suyash.job_readiness_platform.entity.User;
import com.suyash.job_readiness_platform.exception.ResourceNotFoundException;
import com.suyash.job_readiness_platform.repository.JobDescriptionRepository;
import com.suyash.job_readiness_platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobDescriptionService {
    private final JobDescriptionRepository jdRepository;
    private final UserRepository userRepository;

    public JobDescriptionResponse create(String email, CreateJdRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        JobDescription jd = JobDescription.builder()
                .user(user)
                .title(request.title())
                .company(request.company())
                .rawText(request.rawText())
                .build();
        jdRepository.save(jd);
        return new JobDescriptionResponse(jd.getId(), jd.getTitle(), jd.getCompany());
    }
    public List<JobDescriptionResponse> listMine(String email) {
        return jdRepository.findByUserEmailOrderByCreatedAtDesc(email).stream()
                .map(jd -> new JobDescriptionResponse(jd.getId(), jd.getTitle(), jd.getCompany()))
                .toList();
    }
}