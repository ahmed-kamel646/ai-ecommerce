package com.ahmed.ecommerce.cart;

import com.ahmed.ecommerce.user.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    @EntityGraph(attributePaths = {"items", "items.product", "items.product.category"})
    Optional<Cart> findWithItemsByUser(User user);
}
