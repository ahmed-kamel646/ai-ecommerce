package com.ahmed.ecommerce.order.dto;

import java.time.Instant;
import java.util.List;
import lombok.Data;

@Data
public class OrderDto {
    private Long id;
    private Double total;
    private String status;
    private Instant createdAt;
    private List<OrderItemDto> items;
}
