package com.ahmed.ecommerce.order.dto;

import com.ahmed.ecommerce.order.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PlaceOrderRequest(
        @NotBlank @Size(max = 500) String shippingAddress,
        @NotNull PaymentMethod paymentMethod
) {
}
