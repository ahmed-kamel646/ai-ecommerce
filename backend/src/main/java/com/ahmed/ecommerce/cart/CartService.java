package com.ahmed.ecommerce.cart;

import com.ahmed.ecommerce.cart.dto.CartDto;
import com.ahmed.ecommerce.cart.dto.CartItemDto;
import com.ahmed.ecommerce.product.Product;
import com.ahmed.ecommerce.product.ProductRepository;
import com.ahmed.ecommerce.user.User;
import com.ahmed.ecommerce.user.UserRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public Cart getOrCreateCart(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return cartRepository
                .findByUser(user)
                .orElseGet(
                        () -> {
                            Cart newCart = new Cart();
                            newCart.setUser(user);
                            return cartRepository.save(newCart);
                        });
    }

    public CartDto getCartDto(String email) {
        Cart cart = getOrCreateCart(email);
        return mapToDto(cart);
    }

    public CartDto addItem(String email, Long productId, int quantity) {
        Cart cart = getOrCreateCart(email);
        Product product = productRepository.findById(productId).orElseThrow();

        Optional<CartItem> existingItem =
                cart.getItems().stream()
                        .filter(i -> i.getProduct().getId().equals(productId))
                        .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            cart.getItems().add(newItem);
        }

        cartRepository.save(cart);
        return mapToDto(cart);
    }

    public CartDto updateItem(String email, Long itemId, int quantity) {
        Cart cart = getOrCreateCart(email);
        CartItem item = cartItemRepository.findById(itemId).orElseThrow();

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new IllegalArgumentException("Item does not belong to your cart");
        }

        if (quantity == 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(quantity);
        }

        cartRepository.save(cart);
        return mapToDto(cart);
    }

    public void removeItem(String email, Long itemId) {
        updateItem(email, itemId, 0);
    }

    private CartDto mapToDto(Cart cart) {
        CartDto dto = new CartDto();
        double total = 0;
        java.util.List<CartItemDto> itemDtos = new java.util.ArrayList<>();

        for (CartItem item : cart.getItems()) {
            CartItemDto itemDto = new CartItemDto();
            itemDto.setId(item.getId());
            itemDto.setProductId(item.getProduct().getId());
            itemDto.setName(item.getProduct().getName());
            itemDto.setUnitPrice(item.getProduct().getPrice());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setImageUrl(item.getProduct().getImageUrl());
            itemDtos.add(itemDto);
            total += item.getQuantity() * item.getProduct().getPrice();
        }

        dto.setItems(itemDtos);
        dto.setTotal(total);
        return dto;
    }
}
