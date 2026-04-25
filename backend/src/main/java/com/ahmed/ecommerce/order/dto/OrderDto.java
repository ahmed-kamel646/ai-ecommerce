package com.ahmed.ecommerce.order.dto;

import com.ahmed.ecommerce.order.OrderStatus;
import com.ahmed.ecommerce.order.PaymentMethod;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record OrderDto(
        Long id,
        BigDecimal total,
        OrderStatus status,
        String shippingAddress,
        PaymentMethod paymentMethod,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        List<OrderItemDto> items
) {
}
