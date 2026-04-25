package com.ahmed.ecommerce.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CartItemRequest {
    private Long productId;

    @NotNull
    @Min(0)
    private Integer quantity;
}
