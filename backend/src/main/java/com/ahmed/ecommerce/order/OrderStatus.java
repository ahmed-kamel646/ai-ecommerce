package com.ahmed.ecommerce.order;

import java.util.Map;
import java.util.Set;

public enum OrderStatus {
    PENDING,
    PAID,
    SHIPPED,
    DELIVERED,
    CANCELLED;

    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED = Map.of(
            PENDING, Set.of(PAID, CANCELLED),
            PAID, Set.of(SHIPPED, CANCELLED),
            SHIPPED, Set.of(DELIVERED, CANCELLED),
            DELIVERED, Set.of(),
            CANCELLED, Set.of()
    );

    public boolean canTransitionTo(OrderStatus next) {
        return ALLOWED.getOrDefault(this, Set.of()).contains(next);
    }
}
