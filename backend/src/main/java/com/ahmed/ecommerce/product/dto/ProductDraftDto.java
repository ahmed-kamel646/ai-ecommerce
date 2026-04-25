package com.ahmed.ecommerce.product.dto;

import java.util.List;
import lombok.Data;

@Data
public class ProductDraftDto {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Integer stock;
    private String imageUrl;
    private List<String> seoTags;
    private Long categoryId;
    private boolean draft;
}
