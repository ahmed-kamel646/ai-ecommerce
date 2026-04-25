package com.ahmed.ecommerce.cart.dto;

import java.math.BigDecimal;

public record CartItemDto(
        Long id,
        Long productId,
        String name,
        BigDecimal unitPrice,
        int quantity,
        String imageUrl,
        int stock
) {
}
