package com.ahmed.ecommerce.order;

import com.ahmed.ecommerce.order.dto.OrderDto;
import com.ahmed.ecommerce.order.dto.OrderStatusRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping("/api/orders")
    public ResponseEntity<OrderDto> placeOrder(Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.placeOrder(authentication.getName()));
    }

    @GetMapping("/api/orders")
    public List<OrderDto> getUserOrders(Authentication authentication) {
        return orderService.getUserOrders(authentication.getName());
    }

    // Admin endpoints

    @GetMapping("/api/admin/orders")
    public List<OrderDto> getAllOrders(@RequestParam(required = false) String status) {
        return orderService.getAllOrders(status);
    }

    @PatchMapping("/api/admin/orders/{id}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Long id, @Valid @RequestBody OrderStatusRequest request) {
        orderService.updateOrderStatus(id, request.getStatus());
        return ResponseEntity.ok().build();
    }
}
