package com.ahmed.ecommerce.auth;

import io.jsonwebtoken.ExpiredJwtException;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String VALID_SECRET = "test-secret-please-replace-with-a-32-character-long-secret";

    private JwtService createService(long expirationMs) {
        JwtService service = new JwtService(VALID_SECRET, expirationMs);
        service.init();
        return service;
    }

    private UserDetails user(String email) {
        return User.withUsername(email).password("x").roles("SHOPPER").build();
    }

    @Test
    void shortSecretFailsFast() {
        JwtService service = new JwtService("too-short", 60_000);
        assertThatThrownBy(service::init).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void generateAndExtractEmail() {
        JwtService service = createService(60_000);
        String token = service.generate(user("a@b.com"), "SHOPPER");
        assertThat(service.extractEmail(token)).isEqualTo("a@b.com");
        assertThat(service.validate(token, user("a@b.com"))).isTrue();
    }

    @Test
    void tamperedTokenFailsValidation() {
        JwtService service = createService(60_000);
        String token = service.generate(user("a@b.com"), "SHOPPER") + "x";
        assertThat(service.validate(token, user("a@b.com"))).isFalse();
    }

    @Test
    void expiredTokenThrows() throws InterruptedException {
        JwtService service = createService(1);
        String token = service.generate(user("a@b.com"), "SHOPPER");
        Thread.sleep(50);
        assertThatThrownBy(() -> service.extractEmail(token)).isInstanceOf(ExpiredJwtException.class);
    }
}
