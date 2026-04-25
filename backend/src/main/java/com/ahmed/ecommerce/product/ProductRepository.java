package com.ahmed.ecommerce.product;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query(
            "SELECT p FROM Product p WHERE "
                    + "(:categoryId IS NULL OR p.category.id = :categoryId) AND "
                    + "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> findFiltered(
            @Param("categoryId") Long categoryId,
            @Param("search") String search,
            Pageable pageable);

    @Query(
            "select new com.ahmed.ecommerce.product.ProductVectorDto(p.id, p.imageVector) "
                    + "from Product p where p.imageVector is not null and p.id <> :excludeId")
    List<ProductVectorDto> findAllVectorsExcept(@Param("excludeId") long excludeId);
}
