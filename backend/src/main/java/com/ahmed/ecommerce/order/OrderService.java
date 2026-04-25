package com.ahmed.ecommerce.order;

import com.ahmed.ecommerce.cart.Cart;
import com.ahmed.ecommerce.cart.CartItem;
import com.ahmed.ecommerce.cart.CartItemRepository;
import com.ahmed.ecommerce.cart.CartRepository;
import com.ahmed.ecommerce.common.BusinessException;
import com.ahmed.ecommerce.common.NotFoundException;
import com.ahmed.ecommerce.order.dto.OrderDto;
import com.ahmed.ecommerce.order.dto.OrderItemDto;
import com.ahmed.ecommerce.order.dto.PlaceOrderRequest;
import com.ahmed.ecommerce.product.Product;
import com.ahmed.ecommerce.product.ProductRepository;
import com.ahmed.ecommerce.user.User;
import com.ahmed.ecommerce.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    public static final int MAX_PAGE_SIZE = 50;

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    /**
     * Place an order from the current user's cart. The whole transaction must
     * succeed or none of it commits — stock decrement uses the @Version on
     * Product so two concurrent placements over the last unit return 409.
     */
    public OrderDto placeOrder(Authentication authentication, PlaceOrderRequest req) {
        User user = currentUser(authentication);
        Cart cart = cartRepository.findWithItemsByUser(user)
                .orElseThrow(() -> new BusinessException("Cart is empty"));
        if (cart.getItems().isEmpty()) {
            throw new BusinessException("Cart is empty");
        }

        Order order = Order.builder()
                .user(user)
                .total(BigDecimal.ZERO)
                .status(OrderStatus.PENDING)
                .shippingAddress(req.shippingAddress())
                .paymentMethod(req.paymentMethod())
                .build();

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> items = new ArrayList<>();

        for (CartItem ci : cart.getItems()) {
            Product product = ci.getProduct();
            if (product.isDraft()) {
                throw new BusinessException("Product no longer available: " + product.getId());
            }
            if (ci.getQuantity() > product.getStock()) {
                throw new BusinessException("Insufficient stock for product " + product.getId());
            }
            // Atomic stock + sold_count change inside the same managed entity, will trigger
            // the @Version check on commit.
            product.setStock(product.getStock() - ci.getQuantity());
            product.setSoldCount(product.getSoldCount() + ci.getQuantity());

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productName(product.getName())
                    .productImageUrl(product.getImageUrl())
                    .unitPrice(product.getPrice())
                    .quantity(ci.getQuantity())
                    .build();
            items.add(item);
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())));
        }

        order.setItems(items);
        order.setTotal(total);
        Order saved = orderRepository.save(order);

        // Empty cart after success.
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();

        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public OrderDto getMyOrder(Authentication authentication, Long id) {
        User user = currentUser(authentication);
        Order order = orderRepository.findWithItemsById(id)
                .orElseThrow(() -> new NotFoundException("Order not found: " + id));
        if (!order.getUser().getId().equals(user.getId())) {
            throw new NotFoundException("Order not found: " + id);
        }
        return toDto(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> listMyOrders(Authentication authentication, int page, int size) {
        User user = currentUser(authentication);
        Pageable pageable = PageRequest.of(Math.max(page, 0),
                Math.min(Math.max(size, 1), MAX_PAGE_SIZE));
        return orderRepository.findByUserOrderByCreatedAtDesc(user, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> listAll(int page, int size, OrderStatus status) {
        Pageable pageable = PageRequest.of(Math.max(page, 0),
                Math.min(Math.max(size, 1), MAX_PAGE_SIZE));
        if (status == null) {
            return orderRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toDto);
        }
        return orderRepository.findByStatusOrderByCreatedAtDesc(status, pageable).map(this::toDto);
    }

    public OrderDto updateStatus(Long id, OrderStatus next) {
        Order order = orderRepository.findWithItemsById(id)
                .orElseThrow(() -> new NotFoundException("Order not found: " + id));
        if (!order.getStatus().canTransitionTo(next)) {
            throw new BusinessException(
                    "Invalid order status transition: " + order.getStatus() + " -> " + next);
        }
        // Restore stock on cancellation.
        if (next == OrderStatus.CANCELLED && order.getStatus() != OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                Product p = item.getProduct();
                if (p != null) {
                    p.setStock(p.getStock() + item.getQuantity());
                    p.setSoldCount(Math.max(0, p.getSoldCount() - item.getQuantity()));
                }
            }
        }
        order.setStatus(next);
        return toDto(order);
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private OrderDto toDto(Order order) {
        List<OrderItemDto> items = order.getItems().stream()
                .map(it -> new OrderItemDto(
                        it.getId(),
                        it.getProduct() == null ? null : it.getProduct().getId(),
                        it.getProductName(),
                        it.getProductImageUrl(),
                        it.getUnitPrice(),
                        it.getQuantity()))
                .toList();
        return new OrderDto(
                order.getId(),
                order.getTotal(),
                order.getStatus(),
                order.getShippingAddress(),
                order.getPaymentMethod(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                items);
    }
}
