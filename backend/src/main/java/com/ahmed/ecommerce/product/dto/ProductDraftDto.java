package com.ahmed.ecommerce.product.dto;

import java.math.BigDecimal;
import java.util.List;

public record ProductDraftDto(
        Long id,
        String name,
        String description,
        BigDecimal price,
        int stock,
        String imageUrl,
        List<String> seoTags,
        String categoryName
) {
}
