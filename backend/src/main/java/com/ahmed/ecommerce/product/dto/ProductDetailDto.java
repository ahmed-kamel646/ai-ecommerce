package com.ahmed.ecommerce.product.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record ProductDetailDto(
        Long id,
        String name,
        String description,
        BigDecimal price,
        int stock,
        String imageUrl,
        List<String> seoTags,
        String categoryName,
        Long categoryId,
        OffsetDateTime createdAt
) {
}
