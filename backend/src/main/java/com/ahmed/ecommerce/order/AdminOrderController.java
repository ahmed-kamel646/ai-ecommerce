package com.ahmed.ecommerce.order;

import com.ahmed.ecommerce.common.PageResponse;
import com.ahmed.ecommerce.order.dto.OrderDto;
import com.ahmed.ecommerce.order.dto.UpdateOrderStatusRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public PageResponse<OrderDto> list(@RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "20") int size,
                                        @RequestParam(required = false) OrderStatus status) {
        return PageResponse.of(orderService.listAll(page, size, status));
    }

    @PatchMapping("/{id}")
    public OrderDto updateStatus(@PathVariable Long id,
                                  @Valid @RequestBody UpdateOrderStatusRequest req) {
        return orderService.updateStatus(id, req.status());
    }
}
