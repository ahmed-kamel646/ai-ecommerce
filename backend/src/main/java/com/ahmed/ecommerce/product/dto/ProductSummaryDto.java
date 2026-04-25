package com.ahmed.ecommerce.product.dto;

import java.math.BigDecimal;

public record ProductSummaryDto(
        Long id,
        String name,
        BigDecimal price,
        String imageUrl,
        String categoryName,
        int stock,
        boolean draft,
        long soldCount
) {
}
