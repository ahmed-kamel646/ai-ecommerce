package com.ahmed.ecommerce.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProductDraftRequest(
        @NotBlank @Size(max = 255) String name,
        @NotNull @DecimalMin(value = "0.00", inclusive = true) BigDecimal price,
        @PositiveOrZero int stock,
        @NotNull Long categoryId
) {
}
