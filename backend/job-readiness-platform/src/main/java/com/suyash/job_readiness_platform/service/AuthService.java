package com.suyash.job_readiness_platform.service;

import com.suyash.job_readiness_platform.dto.AuthResponse;
import com.suyash.job_readiness_platform.dto.LoginRequest;
import com.suyash.job_readiness_platform.dto.RegisterRequest;
import com.suyash.job_readiness_platform.entity.User;
import com.suyash.job_readiness_platform.exception.DuplicateEmailException;
import com.suyash.job_readiness_platform.repository.UserRepository;
import com.suyash.job_readiness_platform.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateEmailException("Email already registered");
        }
        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .build();
        userRepository.save(user);
        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        String token = jwtService.generateToken(request.email());
        return new AuthResponse(token, request.email());
    }
}