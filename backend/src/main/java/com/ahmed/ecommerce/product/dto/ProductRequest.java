package com.ahmed.ecommerce.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductRequest {
    @NotBlank private String name;
    @NotNull private Double price;
    @NotNull private Integer stock;
    @NotNull private Long categoryId;
    private Boolean autoApprove = false;
}
