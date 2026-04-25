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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new EmailAlreadyExistsException(req.email());
        }
        User user = User.builder()
                .email(req.email())
                .passwordHash(passwordEncoder.encode(req.password()))
                .role(Role.SHOPPER)
                .build();
        userRepository.save(user);
        String token = jwtService.generate(
                org.springframework.security.core.userdetails.User
                        .withUsername(user.getEmail())
                        .password(user.getPasswordHash())
                        .roles(user.getRole().name())
                        .build(),
                user.getRole().name());
        return new AuthResponse(token, user.getRole(), user.getEmail());
    }

    public AuthResponse login(LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        UserDetails principal = (UserDetails) auth.getPrincipal();
        User user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        String token = jwtService.generate(principal, user.getRole().name());
        return new AuthResponse(token, user.getRole(), user.getEmail());
    }
}
