package com.ahmed.ecommerce.product;

import com.ahmed.ecommerce.ai.DraftResult;
import com.ahmed.ecommerce.ai.EmbeddingService;
import com.ahmed.ecommerce.ai.GenerativeService;
import com.ahmed.ecommerce.product.dto.ProductDraftDto;
import com.ahmed.ecommerce.product.dto.ProductDraftRequest;
import com.ahmed.ecommerce.storage.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Implements Rule 4 of the v4 spec: split AI work out of any DB transaction.
 *
 * <pre>
 *   Tx1: persist a placeholder Product (draft=true, vector=null) ── COMMIT
 *        ↓ (no transaction here — AI calls happen on the wire)
 *   embed image → vector
 *   generate description / tags
 *        ↓
 *   Tx2: load same Product, set fields, draft=false ── COMMIT
 * </pre>
 *
 * <p>If anything between the two transactions fails, the placeholder remains
 * in the DB as a draft and {@code VectorBackfillRunner} will retry the
 * embedding the next time the app starts.
 *
 * <p>This bean has NO {@code @Transactional}; it delegates to
 * {@link ProductPersistenceService} for the two short tx boundaries.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductAiOrchestrator {

    private final ProductPersistenceService persistence;
    private final StorageService storageService;
    private final EmbeddingService embeddingService;
    private final GenerativeService generativeService;
    private final ProductMapper mapper;

    public ProductDraftDto createDraft(ProductDraftRequest req, MultipartFile image) {
        StorageService.StoredImage stored = storageService.save(image);
        Product placeholder = persistence.persistPlaceholder(req, stored.url());

        DraftResult ai = safeGenerate(placeholder.getName(),
                placeholder.getCategory() == null ? null : placeholder.getCategory().getName(),
                stored.bytes());
        double[] vector = safeEmbed(stored.bytes(), stored.contentType());

        Product finalised = persistence.applyAiResult(placeholder.getId(), ai, vector);
        return mapper.toDraft(finalised);
    }

    private DraftResult safeGenerate(String name, String category, byte[] image) {
        try {
            return generativeService.generateDraft(name, category, image);
        } catch (Exception e) {
            log.warn("Generative service failed for product '{}': {}", name, e.getMessage());
            return DraftResult.empty();
        }
    }

    private double[] safeEmbed(byte[] image, String contentType) {
        try {
            return embeddingService.embedImage(image, contentType);
        } catch (Exception e) {
            log.warn("Embedding service failed: {}", e.getMessage());
            return null;
        }
    }
}
