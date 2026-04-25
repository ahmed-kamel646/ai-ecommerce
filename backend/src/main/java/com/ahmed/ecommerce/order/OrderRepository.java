package com.ahmed.ecommerce.order;

import com.ahmed.ecommerce.user.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);

    List<Order> findByStatus(String status);
}
