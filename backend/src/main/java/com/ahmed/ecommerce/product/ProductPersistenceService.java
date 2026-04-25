package com.ahmed.ecommerce.product;

import com.ahmed.ecommerce.ai.DraftResult;
import com.ahmed.ecommerce.category.Category;
import com.ahmed.ecommerce.category.CategoryRepository;
import com.ahmed.ecommerce.common.NotFoundException;
import com.ahmed.ecommerce.product.dto.ProductDraftRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Holds the two short {@code @Transactional} boundaries that bracket the AI
 * call in {@link ProductAiOrchestrator}. Lives in a separate bean so Spring's
 * AOP proxy actually applies the transaction (proxies don't intercept
 * self-invocation within the same instance).
 */
@Service
@RequiredArgsConstructor
public class ProductPersistenceService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    /** Tx1 of Rule 4 — persist the placeholder Product. */
    @Transactional
    public Product persistPlaceholder(ProductDraftRequest req, String imageUrl) {
        Category category = categoryRepository.findById(req.categoryId())
                .orElseThrow(() -> new NotFoundException("Category not found: " + req.categoryId()));
        Product p = Product.builder()
                .name(req.name())
                .description("")
                .price(req.price())
                .stock(req.stock())
                .imageUrl(imageUrl)
                .seoTags("")
                .category(category)
                .draft(true)
                .build();
        return productRepository.save(p);
    }

    /** Tx2 of Rule 4 — apply the AI result to the persisted draft. */
    @Transactional
    public Product applyAiResult(Long productId, DraftResult ai, double[] vector) {
        Product p = productRepository.findWithCategoryById(productId)
                .orElseThrow(() -> new NotFoundException("Product disappeared: " + productId));
        if (ai != null) {
            if (ai.description() != null && !ai.description().isBlank()) {
                p.setDescription(ai.description());
            }
            if (ai.seoTagsCsv() != null && !ai.seoTagsCsv().isBlank()) {
                p.setSeoTags(ai.seoTagsCsv());
            }
        }
        if (vector != null) {
            p.setImageVector(vector);
        }
        if ((ai != null && ai.description() != null && !ai.description().isBlank()) || vector != null) {
            p.setDraft(false);
        }
        return p;
    }

    /** Used by the backfill runner — set vector for an existing product. */
    @Transactional
    public void setVector(Long productId, double[] vector) {
        if (vector == null) return;
        productRepository.findById(productId).ifPresent(p -> p.setImageVector(vector));
    }
}
