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
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Type;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "product")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String description = "";

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private int stock;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "seo_tags", nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private String seoTags = "";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Type(DoubleArrayUserType.class)
    @Column(name = "image_vector", columnDefinition = "FLOAT8[]")
    private double[] imageVector;

    /**
     * Java field is named 'draft' (NOT 'isDraft') to avoid Jackson serializing
     * the getter as JSON property "draft" while MapStruct sees "draft" — keeping
     * field, getter, and JSON aligned. The DB column is also `draft`.
     */
    @Column(name = "draft", nullable = false)
    @Builder.Default
    private boolean draft = false;

    @Column(name = "sold_count", nullable = false)
    @Builder.Default
    private long soldCount = 0;

    @Version
    @Column(nullable = false)
    private long version;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}
