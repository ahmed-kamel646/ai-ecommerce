package com.ahmed.ecommerce.product;

import com.ahmed.ecommerce.product.dto.ProductVectorDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @EntityGraph(attributePaths = {"category"})
    Optional<Product> findWithCategoryById(Long id);

    @EntityGraph(attributePaths = {"category"})
    @Query("""
            SELECT p FROM Product p
            WHERE (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', cast(:search as string), '%')))
              AND (:categoryId IS NULL OR p.category.id = :categoryId)
              AND p.draft = false
            """)
    Page<Product> findFiltered(@Param("search") String search,
                               @Param("categoryId") Long categoryId,
                               Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    List<Product> findAllByIdInAndDraftFalse(List<Long> ids);

    @Query("SELECT new com.ahmed.ecommerce.product.dto.ProductVectorDto(p.id, p.imageVector) " +
            "FROM Product p WHERE p.id <> :id AND p.imageVector IS NOT NULL AND p.draft = false")
    List<ProductVectorDto> findVectorsExcept(@Param("id") long id);

    @Query("SELECT p.id FROM Product p WHERE p.imageVector IS NULL")
    List<Long> findIdsByImageVectorIsNull();

    long countByDraftTrue();
}
