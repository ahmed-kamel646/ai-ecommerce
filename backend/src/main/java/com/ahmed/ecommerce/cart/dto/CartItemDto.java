package com.ahmed.ecommerce.cart.dto;

import lombok.Data;

@Data
public class CartItemDto {
    private Long id;
    private Long productId;
    private String name;
    private Double unitPrice;
    private Integer quantity;
    private String imageUrl;
}
