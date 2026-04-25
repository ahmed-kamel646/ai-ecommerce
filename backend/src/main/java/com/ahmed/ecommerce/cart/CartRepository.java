package com.ahmed.ecommerce.cart;

import com.ahmed.ecommerce.user.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user);
}
