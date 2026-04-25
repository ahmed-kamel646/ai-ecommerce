package com.ahmed.ecommerce.order;

import com.ahmed.ecommerce.AbstractIntegrationTest;
import com.ahmed.ecommerce.cart.CartService;
import com.ahmed.ecommerce.cart.dto.AddToCartRequest;
import com.ahmed.ecommerce.common.BusinessException;
import com.ahmed.ecommerce.order.dto.OrderDto;
import com.ahmed.ecommerce.order.dto.PlaceOrderRequest;
import com.ahmed.ecommerce.product.Product;
import com.ahmed.ecommerce.product.ProductRepository;
import com.ahmed.ecommerce.user.User;
import com.ahmed.ecommerce.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class OrderServiceIntegrationTest extends AbstractIntegrationTest {

    @Autowired OrderService orderService;
    @Autowired CartService cartService;
    @Autowired UserRepository userRepository;
    @Autowired ProductRepository productRepository;

    Authentication shopperAuth;
    Long firstProductId;
    int initialStock;
    long initialSold;

    @BeforeEach
    void setup() {
        User shopper = userRepository.findByEmail("shopper@demo.com").orElseThrow();
        shopperAuth = new UsernamePasswordAuthenticationToken(shopper.getEmail(), "");
        Product first = productRepository.findAll().get(0);
        firstProductId = first.getId();
        initialStock = first.getStock();
        initialSold = first.getSoldCount();
        cartService.clearCart(shopperAuth);
    }

    @Test
    void placingOrderDecrementsStockAndIncrementsSoldCount() {
        cartService.addItem(shopperAuth, new AddToCartRequest(firstProductId, 2));
        OrderDto created = orderService.placeOrder(shopperAuth,
                new PlaceOrderRequest("123 Test St", com.ahmed.ecommerce.order.PaymentMethod.COD));
        assertThat(created.status()).isEqualTo(OrderStatus.PENDING);
        assertThat(created.items()).hasSize(1);
        assertThat(created.total()).isPositive();

        Product after = productRepository.findById(firstProductId).orElseThrow();
        assertThat(after.getStock()).isEqualTo(initialStock - 2);
        assertThat(after.getSoldCount()).isEqualTo(initialSold + 2);
    }

    @Test
    void emptyCartFailsWith409() {
        assertThatThrownBy(() -> orderService.placeOrder(shopperAuth,
                new PlaceOrderRequest("addr", com.ahmed.ecommerce.order.PaymentMethod.COD)))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void cancelTransitionRestoresStock() {
        cartService.addItem(shopperAuth, new AddToCartRequest(firstProductId, 3));
        OrderDto created = orderService.placeOrder(shopperAuth,
                new PlaceOrderRequest("addr", com.ahmed.ecommerce.order.PaymentMethod.COD));
        OrderDto cancelled = orderService.updateStatus(created.id(), OrderStatus.CANCELLED);
        assertThat(cancelled.status()).isEqualTo(OrderStatus.CANCELLED);
        Product after = productRepository.findById(firstProductId).orElseThrow();
        assertThat(after.getStock()).isEqualTo(initialStock);
    }

    @Test
    void invalidStatusTransitionRejected() {
        cartService.addItem(shopperAuth, new AddToCartRequest(firstProductId, 1));
        OrderDto created = orderService.placeOrder(shopperAuth,
                new PlaceOrderRequest("addr", com.ahmed.ecommerce.order.PaymentMethod.COD));
        assertThatThrownBy(() -> orderService.updateStatus(created.id(), OrderStatus.DELIVERED))
                .isInstanceOf(BusinessException.class);
    }
}
