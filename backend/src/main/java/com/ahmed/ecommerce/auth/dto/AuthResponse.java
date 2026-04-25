package com.ahmed.ecommerce.auth.dto;

import com.ahmed.ecommerce.user.Role;

public record AuthResponse(String accessToken, Role role, String email) {
}
