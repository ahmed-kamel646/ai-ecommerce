package com.ahmed.ecommerce.product;

import com.ahmed.ecommerce.product.dto.ProductDetailDto;
import com.ahmed.ecommerce.product.dto.ProductDraftDto;
import com.ahmed.ecommerce.product.dto.ProductSummaryDto;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class ProductMapper {

    public ProductSummaryDto toSummary(Product p) {
        return new ProductSummaryDto(
                p.getId(),
                p.getName(),
                p.getPrice(),
                p.getImageUrl(),
                p.getCategory() == null ? null : p.getCategory().getName(),
                p.getStock(),
                p.isDraft(),
                p.getSoldCount());
    }

    public ProductDetailDto toDetail(Product p) {
        return new ProductDetailDto(
                p.getId(),
                p.getName(),
                p.getDescription() == null ? "" : p.getDescription(),
                p.getPrice(),
                p.getStock(),
                p.getImageUrl(),
                splitTags(p.getSeoTags()),
                p.getCategory() == null ? null : p.getCategory().getName(),
                p.getCategory() == null ? null : p.getCategory().getId(),
                p.getCreatedAt());
    }

    public ProductDraftDto toDraft(Product p) {
        return new ProductDraftDto(
                p.getId(),
                p.getName(),
                p.getDescription() == null ? "" : p.getDescription(),
                p.getPrice(),
                p.getStock(),
                p.getImageUrl(),
                splitTags(p.getSeoTags()),
                p.getCategory() == null ? null : p.getCategory().getName());
    }

    private List<String> splitTags(String csv) {
        if (csv == null || csv.isBlank()) return List.of();
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
    }
}
