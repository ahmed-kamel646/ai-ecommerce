package com.ahmed.ecommerce.product.dto;

import lombok.Data;

@Data
public class ProductSummaryDto {
    private Long id;
    private String name;
    private Double price;
    private String imageUrl;
    private String categoryName;
}
