package com.ahmed.ecommerce.cart.dto;

import java.math.BigDecimal;
import java.util.List;

public record CartDto(List<CartItemDto> items, BigDecimal total) {
}
