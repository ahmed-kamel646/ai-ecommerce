package com.ahmed.ecommerce.order.dto;

import com.ahmed.ecommerce.order.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(@NotNull OrderStatus status) {
}
