package com.ahmed.ecommerce.order;

import com.ahmed.ecommerce.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"items"})
    Page<Order> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    @EntityGraph(attributePaths = {"items"})
    Optional<Order> findWithItemsById(Long id);

    @EntityGraph(attributePaths = {"items"})
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = {"items"})
    Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);

    long countByCreatedAtAfter(OffsetDateTime since);

    List<Order> findByCreatedAtAfter(OffsetDateTime since);
}
