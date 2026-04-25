package com.ahmed.ecommerce.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ahmed.ecommerce.auth.dto.AuthResponse;
import com.ahmed.ecommerce.auth.dto.LoginRequest;
import com.ahmed.ecommerce.auth.dto.RegisterRequest;
import com.ahmed.ecommerce.user.Role;
import com.ahmed.ecommerce.user.User;
import com.ahmed.ecommerce.user.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks private AuthService authService;

    @Test
    void testRegisterHashesPassword() {
        RegisterRequest req = new RegisterRequest("test@test.com", "password");
        when(userRepository.existsByEmail("test@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("hashed_password");
        when(jwtService.generateToken(any())).thenReturn("token");

        authService.register(req);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());

        User savedUser = captor.getValue();
        assertThat(savedUser.getPassword()).isEqualTo("hashed_password");
        assertThat(savedUser.getRole()).isEqualTo(Role.SHOPPER);
    }

    @Test
    void testLoginSuccess() {
        LoginRequest req = new LoginRequest("test@test.com", "password");
        User user = new User();
        user.setEmail("test@test.com");
        user.setRole(Role.SHOPPER);

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("token");

        AuthResponse resp = authService.login(req);

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        assertThat(resp.getAccessToken()).isEqualTo("token");
        assertThat(resp.getEmail()).isEqualTo("test@test.com");
    }

    @Test
    void testLoginWrongPassword() {
        LoginRequest req = new LoginRequest("test@test.com", "wrong");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(BadCredentialsException.class);
    }
}
