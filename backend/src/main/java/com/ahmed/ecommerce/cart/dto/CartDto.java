package com.ahmed.ecommerce.cart.dto;

import java.util.List;
import lombok.Data;

@Data
public class CartDto {
    private List<CartItemDto> items;
    private Double total;
}
