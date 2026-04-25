package com.ahmed.ecommerce.order;

import com.ahmed.ecommerce.cart.Cart;
import com.ahmed.ecommerce.cart.CartItem;
import com.ahmed.ecommerce.cart.CartRepository;
import com.ahmed.ecommerce.order.dto.OrderDto;
import com.ahmed.ecommerce.order.dto.OrderItemDto;
import com.ahmed.ecommerce.product.Product;
import com.ahmed.ecommerce.product.ProductRepository;
import com.ahmed.ecommerce.user.User;
import com.ahmed.ecommerce.user.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderDto placeOrder(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Cart cart =
                cartRepository
                        .findByUser(user)
                        .orElseThrow(() -> new IllegalArgumentException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        Order order = new Order();
        order.setUser(user);
        double total = 0;

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            if (product.getStock() < cartItem.getQuantity()) {
                throw new IllegalStateException(
                        "Not enough stock for product: " + product.getName());
            }

            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            order.getItems().add(orderItem);

            total += product.getPrice() * cartItem.getQuantity();
        }

        order.setTotal(total);
        orderRepository.save(order);

        cart.getItems().clear();
        cartRepository.save(cart);

        return mapToDto(order);
    }

    public List<OrderDto> getUserOrders(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return orderRepository.findByUser(user).stream().map(this::mapToDto).toList();
    }

    public List<OrderDto> getAllOrders(String status) {
        if (status != null && !status.isBlank()) {
            return orderRepository.findByStatus(status).stream().map(this::mapToDto).toList();
        }
        return orderRepository.findAll().stream().map(this::mapToDto).toList();
    }

    @Transactional
    public void updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        String currentStatus = order.getStatus();

        if ("CANCELLED".equals(newStatus)) {
            order.setStatus(newStatus);
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }
            orderRepository.save(order);
            return;
        }

        boolean valid =
                switch (currentStatus) {
                    case "PENDING" -> "PAID".equals(newStatus);
                    case "PAID" -> "SHIPPED".equals(newStatus);
                    case "SHIPPED" -> "DELIVERED".equals(newStatus);
                    default -> false;
                };

        if (!valid) {
            throw new IllegalArgumentException(
                    "Invalid state transition from " + currentStatus + " to " + newStatus);
        }

        order.setStatus(newStatus);
        orderRepository.save(order);
    }

    private OrderDto mapToDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setTotal(order.getTotal());
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setItems(
                order.getItems().stream()
                        .map(
                                i -> {
                                    OrderItemDto iDto = new OrderItemDto();
                                    iDto.setId(i.getId());
                                    iDto.setProductId(i.getProduct().getId());
                                    iDto.setName(i.getProduct().getName());
                                    iDto.setUnitPrice(i.getUnitPrice());
                                    iDto.setQuantity(i.getQuantity());
                                    return iDto;
                                })
                        .collect(Collectors.toList()));
        return dto;
    }
}
