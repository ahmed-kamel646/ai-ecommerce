package com.ahmed.ecommerce.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductUpdateRequest {
    @Size(max = 255)
    private String name;

    private String description;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal price;

    @Min(0)
    private Integer stock;

    private Long categoryId;

    private String seoTags;

    private Boolean draft;
}
