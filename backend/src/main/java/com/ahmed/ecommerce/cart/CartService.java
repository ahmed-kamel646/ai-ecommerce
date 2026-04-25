package com.ahmed.ecommerce.cart;

import com.ahmed.ecommerce.cart.dto.AddToCartRequest;
import com.ahmed.ecommerce.cart.dto.CartDto;
import com.ahmed.ecommerce.cart.dto.CartItemDto;
import com.ahmed.ecommerce.cart.dto.UpdateCartItemRequest;
import com.ahmed.ecommerce.common.BusinessException;
import com.ahmed.ecommerce.common.NotFoundException;
import com.ahmed.ecommerce.product.Product;
import com.ahmed.ecommerce.product.ProductRepository;
import com.ahmed.ecommerce.user.User;
import com.ahmed.ecommerce.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public CartDto getCart(Authentication authentication) {
        User user = currentUser(authentication);
        Cart cart = cartRepository.findWithItemsByUser(user).orElse(null);
        if (cart == null) return new CartDto(List.of(), BigDecimal.ZERO);
        return toDto(cart);
    }

    public CartDto addItem(Authentication authentication, AddToCartRequest req) {
        User user = currentUser(authentication);
        Cart cart = getOrCreateCart(user);
        Product product = productRepository.findById(req.productId())
                .orElseThrow(() -> new NotFoundException("Product not found: " + req.productId()));
        if (product.isDraft()) {
            throw new NotFoundException("Product not found: " + req.productId());
        }
        int desired = req.quantity();
        CartItem existing = cart.getItems().stream()
                .filter(it -> it.getProduct().getId().equals(product.getId()))
                .findFirst().orElse(null);
        int newQty = (existing == null ? 0 : existing.getQuantity()) + desired;
        if (newQty > product.getStock()) {
            throw new BusinessException("Insufficient stock for product " + product.getId());
        }
        if (existing == null) {
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(desired)
                    .build();
            cart.getItems().add(item);
            cartItemRepository.save(item);
        } else {
            existing.setQuantity(newQty);
        }
        return toDto(cart);
    }

    public CartDto updateItem(Authentication authentication, Long itemId, UpdateCartItemRequest req) {
        User user = currentUser(authentication);
        Cart cart = cartRepository.findWithItemsByUser(user)
                .orElseThrow(() -> new NotFoundException("Cart is empty"));
        CartItem item = cart.getItems().stream()
                .filter(it -> it.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Cart item not found: " + itemId));
        if (req.quantity() == 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            if (req.quantity() > item.getProduct().getStock()) {
                throw new BusinessException("Insufficient stock for product " + item.getProduct().getId());
            }
            item.setQuantity(req.quantity());
        }
        return toDto(cart);
    }

    public CartDto removeItem(Authentication authentication, Long itemId) {
        User user = currentUser(authentication);
        Cart cart = cartRepository.findWithItemsByUser(user)
                .orElseThrow(() -> new NotFoundException("Cart is empty"));
        CartItem item = cart.getItems().stream()
                .filter(it -> it.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Cart item not found: " + itemId));
        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        return toDto(cart);
    }

    public void clearCart(Authentication authentication) {
        User user = currentUser(authentication);
        Cart cart = cartRepository.findWithItemsByUser(user).orElse(null);
        if (cart == null) return;
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
    }

    public Cart getOrCreateCart(User user) {
        return cartRepository.findByUser(user).orElseGet(() -> {
            Cart cart = Cart.builder().user(user).build();
            return cartRepository.save(cart);
        });
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private CartDto toDto(Cart cart) {
        List<CartItemDto> items = cart.getItems().stream()
                .map(it -> new CartItemDto(
                        it.getId(),
                        it.getProduct().getId(),
                        it.getProduct().getName(),
                        it.getProduct().getPrice(),
                        it.getQuantity(),
                        it.getProduct().getImageUrl(),
                        it.getProduct().getStock()))
                .toList();
        BigDecimal total = items.stream()
                .map(i -> i.unitPrice().multiply(BigDecimal.valueOf(i.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new CartDto(items, total);
    }
}
