package com.ahmed.ecommerce.ai;

public interface EmbeddingService {

    /** Length of every vector returned by this service (1408 for multimodalembedding@001). */
    int VECTOR_DIMENSIONS = 1408;

    /**
     * Embed an image into a {@value VECTOR_DIMENSIONS}-dimensional vector. May return null
     * to signal a recoverable failure (the orchestrator should leave existing
     * vectors untouched and let a backfill retry).
     */
    double[] embedImage(byte[] imageBytes, String contentType);
}
