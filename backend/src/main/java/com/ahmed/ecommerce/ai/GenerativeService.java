package com.ahmed.ecommerce.ai;

public interface GenerativeService {

    /**
     * Returns a (description, seoTags csv) pair for the given product context.
     * Implementations must NEVER throw — return a {@link DraftResult} with empty
     * strings on recoverable failure so the orchestrator can persist a placeholder
     * draft without losing the product.
     */
    DraftResult generateDraft(String name, String categoryName, byte[] imageBytes);
}
