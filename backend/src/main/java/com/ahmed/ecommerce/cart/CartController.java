package com.ahmed.ecommerce.cart;

import com.ahmed.ecommerce.cart.dto.AddToCartRequest;
import com.ahmed.ecommerce.cart.dto.CartDto;
import com.ahmed.ecommerce.cart.dto.UpdateCartItemRequest;
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
    public CartDto get(Authentication authentication) {
        return cartService.getCart(authentication);
    }

    @PostMapping("/items")
    public CartDto addItem(Authentication authentication, @Valid @RequestBody AddToCartRequest req) {
        return cartService.addItem(authentication, req);
    }

    @PatchMapping("/items/{id}")
    public CartDto updateItem(Authentication authentication,
                               @PathVariable Long id,
                               @Valid @RequestBody UpdateCartItemRequest req) {
        return cartService.updateItem(authentication, id, req);
    }

    @DeleteMapping("/items/{id}")
    public CartDto removeItem(Authentication authentication, @PathVariable Long id) {
        return cartService.removeItem(authentication, id);
    }

    @DeleteMapping
    public ResponseEntity<Void> clear(Authentication authentication) {
        cartService.clearCart(authentication);
        return ResponseEntity.noContent().build();
    }
}
