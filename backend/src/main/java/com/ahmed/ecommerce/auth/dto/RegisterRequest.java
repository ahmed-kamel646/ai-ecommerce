package com.ahmed.ecommerce.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @Email String email,
        @Size(min = 8, max = 72) String password
) {
}
