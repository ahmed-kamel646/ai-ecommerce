package com.ahmed.ecommerce.user.dto;

import com.ahmed.ecommerce.user.Role;

import java.time.OffsetDateTime;

public record UserDto(Long id, String email, Role role, OffsetDateTime createdAt) {
}
