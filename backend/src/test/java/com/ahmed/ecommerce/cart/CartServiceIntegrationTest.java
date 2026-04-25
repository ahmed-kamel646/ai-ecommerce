package com.ahmed.ecommerce.cart;

import com.ahmed.ecommerce.AbstractIntegrationTest;
import com.ahmed.ecommerce.cart.dto.AddToCartRequest;
import com.ahmed.ecommerce.cart.dto.CartDto;
import com.ahmed.ecommerce.cart.dto.UpdateCartItemRequest;
import com.ahmed.ecommerce.common.BusinessException;
import com.ahmed.ecommerce.common.NotFoundException;
import com.ahmed.ecommerce.product.Product;
import com.ahmed.ecommerce.product.ProductRepository;
import com.ahmed.ecommerce.user.User;
import com.ahmed.ecommerce.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CartServiceIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    CartService cartService;
    @Autowired
    UserRepository userRepository;
    @Autowired
    ProductRepository productRepository;

    Authentication shopperAuth;
    Long firstProductId;

    @BeforeEach
    void cleanup() {
        User shopper = userRepository.findByEmail("shopper@demo.com").orElseThrow();
        shopperAuth = new UsernamePasswordAuthenticationToken(shopper.getEmail(), "");
        firstProductId = productRepository.findAll().get(0).getId();
        cartService.clearCart(shopperAuth);
    }

    @Test
    void addAndUpdateAndRemoveItem() {
        CartDto withOne = cartService.addItem(shopperAuth, new AddToCartRequest(firstProductId, 2));
        assertThat(withOne.items()).hasSize(1);
        assertThat(withOne.items().get(0).quantity()).isEqualTo(2);
        assertThat(withOne.total()).isPositive();

        Long itemId = withOne.items().get(0).id();
        CartDto withThree = cartService.updateItem(shopperAuth, itemId, new UpdateCartItemRequest(3));
        assertThat(withThree.items().get(0).quantity()).isEqualTo(3);

        CartDto removed = cartService.updateItem(shopperAuth, itemId, new UpdateCartItemRequest(0));
        assertThat(removed.items()).isEmpty();
        assertThat(removed.total()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void overStockThrowsBusinessException() {
        Product product = productRepository.findById(firstProductId).orElseThrow();
        int over = product.getStock() + 1;
        assertThatThrownBy(() -> cartService.addItem(shopperAuth, new AddToCartRequest(firstProductId, over)))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void removingMissingItemThrowsNotFound() {
        assertThatThrownBy(() -> cartService.removeItem(shopperAuth, 9999L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void clearCartLeavesEmptyDtoNotNull() {
        cartService.addItem(shopperAuth, new AddToCartRequest(firstProductId, 1));
        cartService.clearCart(shopperAuth);
        CartDto after = cartService.getCart(shopperAuth);
        assertThat(after.items()).isEmpty();
        assertThat(after.total()).isEqualByComparingTo(BigDecimal.ZERO);
    }
}
