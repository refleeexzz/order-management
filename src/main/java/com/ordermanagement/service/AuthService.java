package com.ordermanagement.service;

import com.ordermanagement.domain.entity.User;
import com.ordermanagement.domain.enums.UserRole;
import com.ordermanagement.dto.auth.AuthResponse;
import com.ordermanagement.dto.auth.LoginRequest;
import com.ordermanagement.dto.auth.RegisterRequest;
import com.ordermanagement.exception.DuplicateResourceException;
import com.ordermanagement.repository.UserRepository;
import com.ordermanagement.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        UserRole userRole = UserRole.CUSTOMER;
        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                userRole = UserRole.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                userRole = UserRole.CUSTOMER;
            }
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(userRole)
                .active(true)
                .build();

        userRepository.save(user);
        String token = tokenProvider.generateToken(user.getEmail());

        return AuthResponse.of(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = (User) authentication.getPrincipal();
        String token = tokenProvider.generateToken(authentication);

        return AuthResponse.of(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }
}
