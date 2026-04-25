package com.ahmed.ecommerce.cart;

import com.ahmed.ecommerce.cart.dto.CartDto;
import com.ahmed.ecommerce.cart.dto.CartItemRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public CartDto getCart(Authentication authentication) {
        return cartService.getCartDto(authentication.getName());
    }

    @PostMapping("/items")
    public CartDto addItem(
            @Valid @RequestBody CartItemRequest request, Authentication authentication) {
        return cartService.addItem(
                authentication.getName(), request.getProductId(), request.getQuantity());
    }

    @PatchMapping("/items/{itemId}")
    public CartDto updateItem(
            @PathVariable Long itemId,
            @Valid @RequestBody CartItemRequest request,
            Authentication authentication) {
        return cartService.updateItem(authentication.getName(), itemId, request.getQuantity());
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> removeItem(
            @PathVariable Long itemId, Authentication authentication) {
        cartService.removeItem(authentication.getName(), itemId);
        return ResponseEntity.noContent().build();
    }
}
