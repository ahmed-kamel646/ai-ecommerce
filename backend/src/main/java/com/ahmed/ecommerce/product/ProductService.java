package com.ahmed.ecommerce.product;

import com.ahmed.ecommerce.ai.DraftResult;
import com.ahmed.ecommerce.ai.EmbeddingService;
import com.ahmed.ecommerce.ai.GenerativeService;
import com.ahmed.ecommerce.category.Category;
import com.ahmed.ecommerce.category.CategoryRepository;
import com.ahmed.ecommerce.product.dto.ProductDraftDto;
import com.ahmed.ecommerce.product.dto.ProductRequest;
import com.ahmed.ecommerce.storage.StorageService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final StorageService storageService;
    private final EmbeddingService embeddingService;
    private final GenerativeService generativeService;
    private final ProductMapper productMapper;
    private final RetryTemplate aiRetryTemplate;

    @Transactional
    public ProductDraftDto saveDraftPlaceholder(MultipartFile image, ProductRequest req) {
        Category category =
                categoryRepository
                        .findById(req.getCategoryId())
                        .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = storageService.store(image);
        }

        Product product =
                Product.builder()
                        .name(req.getName())
                        .price(req.getPrice())
                        .stock(req.getStock())
                        .category(category)
                        .imageUrl(imageUrl)
                        .description("")
                        .seoTags("")
                        .imageVector(null)
                        .build();

        product = productRepository.save(product);
        ProductDraftDto dto = productMapper.toDraftDto(product);
        dto.setDraft(!Boolean.TRUE.equals(req.getAutoApprove()));
        return dto;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void attachAiResults(
            long productId, byte[] imageBytes, String name, String categoryName) {
        Product product = productRepository.findById(productId).orElseThrow();

        // Retry Embedding
        double[] vector = null;
        if (imageBytes != null && imageBytes.length > 0) {
            try {
                vector = aiRetryTemplate.execute(context -> embeddingService.embed(imageBytes));
            } catch (Exception e) {
                // Fallback: leave null
            }
        }
        product.setImageVector(vector);

        // Retry Generative
        DraftResult draftResult = null;
        try {
            draftResult =
                    aiRetryTemplate.execute(context -> generativeService.draft(name, categoryName));
        } catch (Exception e) {
            // Fallback: leave empty
        }

        if (draftResult != null) {
            product.setDescription(draftResult.description());
            product.setSeoTags(String.join(",", draftResult.seoTags()));
        }

        productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, ProductDraftDto updateReq) {
        Product product = productRepository.findById(id).orElseThrow();
        Category category = categoryRepository.findById(updateReq.getCategoryId()).orElseThrow();

        product.setName(updateReq.getName());
        product.setPrice(updateReq.getPrice());
        product.setStock(updateReq.getStock());
        product.setCategory(category);
        if (updateReq.getDescription() != null) {
            product.setDescription(updateReq.getDescription());
        }
        if (updateReq.getSeoTags() != null) {
            product.setSeoTags(String.join(",", updateReq.getSeoTags()));
        }
        return productRepository.save(product);
    }

    public DraftResult regenerateText(Long id) {
        Product product = productRepository.findById(id).orElseThrow();
        try {
            return aiRetryTemplate.execute(
                    context ->
                            generativeService.draft(
                                    product.getName(), product.getCategory().getName()));
        } catch (Exception e) {
            return new DraftResult("", List.of());
        }
    }
}
