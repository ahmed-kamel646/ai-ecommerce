package com.ahmed.ecommerce.order;

import com.ahmed.ecommerce.common.PageResponse;
import com.ahmed.ecommerce.order.dto.OrderDto;
import com.ahmed.ecommerce.order.dto.PlaceOrderRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDto> place(Authentication authentication,
                                          @Valid @RequestBody PlaceOrderRequest req) {
        OrderDto created = orderService.placeOrder(authentication, req);
        return ResponseEntity.status(201).body(created);
    }

    @GetMapping
    public PageResponse<OrderDto> myOrders(Authentication authentication,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size) {
        return PageResponse.of(orderService.listMyOrders(authentication, page, size));
    }

    @GetMapping("/{id}")
    public OrderDto myOrder(Authentication authentication, @PathVariable Long id) {
        return orderService.getMyOrder(authentication, id);
    }
}
