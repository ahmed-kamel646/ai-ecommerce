package com.ahmed.ecommerce.auth;

import com.ahmed.ecommerce.auth.dto.AuthResponse;
import com.ahmed.ecommerce.auth.dto.LoginRequest;
import com.ahmed.ecommerce.auth.dto.RegisterRequest;
import com.ahmed.ecommerce.user.Role;
import com.ahmed.ecommerce.user.User;
import com.ahmed.ecommerce.user.UserRepository;
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
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("Email already registered");
        }

        User user =
                User.builder()
                        .email(request.getEmail())
                        .password(passwordEncoder.encode(request.getPassword()))
                        .role(Role.SHOPPER)
                        .build();

        userRepository.save(user);
        String jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .accessToken(jwtToken)
                .role(user.getRole().name())
                .email(user.getEmail())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .accessToken(jwtToken)
                .role(user.getRole().name())
                .email(user.getEmail())
                .build();
    }
}
