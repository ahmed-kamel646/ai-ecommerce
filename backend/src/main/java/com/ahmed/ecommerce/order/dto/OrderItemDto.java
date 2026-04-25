package com.ahmed.ecommerce.order.dto;

import lombok.Data;

@Data
public class OrderItemDto {
    private Long id;
    private Long productId;
    private String name;
    private Double unitPrice;
    private Integer quantity;
}
