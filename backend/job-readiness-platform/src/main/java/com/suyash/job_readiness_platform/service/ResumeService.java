package com.suyash.job_readiness_platform.service;

import com.suyash.job_readiness_platform.entity.Resume;
import com.suyash.job_readiness_platform.entity.User;
import com.suyash.job_readiness_platform.repository.ResumeRepository;
import com.suyash.job_readiness_platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.suyash.job_readiness_platform.dto.ResumeResponse;
import com.suyash.job_readiness_platform.exception.FileParseException;
import com.suyash.job_readiness_platform.exception.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
public class ResumeService {
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final Tika tika = new Tika();

    public ResumeResponse uploadResume(String email, MultipartFile file) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String text;
        try {
            text = tika.parseToString(file.getInputStream());
        } catch (Exception e) {
            throw new FileParseException("Could not read resume file: " + e.getMessage());
        }
        if (text.isBlank()) {
            throw new FileParseException("Resume appears empty or unreadable (scanned image PDFs aren't supported)");
        }

        Resume resume = Resume.builder()
                .user(user)
                .fileName(file.getOriginalFilename())
                .rawText(text)
                .build();
        resumeRepository.save(resume);
        return new ResumeResponse(resume.getId(), resume.getFileName());
    }
}