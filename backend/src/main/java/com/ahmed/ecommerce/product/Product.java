package com.ahmed.ecommerce.product;

import com.ahmed.ecommerce.category.Category;
import com.ahmed.ecommerce.common.DoubleArrayUserType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Integer stock;

    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String seoTags;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Type(DoubleArrayUserType.class)
    @Column(name = "image_vector", columnDefinition = "float8[]")
    private double[] imageVector;
}
