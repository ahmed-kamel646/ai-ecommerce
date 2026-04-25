package com.ahmed.ecommerce.ai.mock;

import com.ahmed.ecommerce.ai.EmbeddingService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.nio.ByteBuffer;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Deterministic mock embedder. Hashes the image bytes with SHA-256 and expands
 * the digest into {@value EmbeddingService#VECTOR_DIMENSIONS} doubles in
 * {@code [-1, 1]}. Same bytes → same vector → same similarity ranking, which
 * keeps tests reproducible.
 */
@Service
@ConditionalOnProperty(prefix = "ai", name = "provider", havingValue = "mock", matchIfMissing = true)
public class MockEmbeddingService implements EmbeddingService {

    @Override
    public double[] embedImage(byte[] imageBytes, String contentType) {
        if (imageBytes == null || imageBytes.length == 0) {
            return new double[VECTOR_DIMENSIONS];
        }
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] seed = md.digest(imageBytes);
            double[] out = new double[VECTOR_DIMENSIONS];
            ByteBuffer buf = ByteBuffer.allocate(8);
            for (int i = 0; i < VECTOR_DIMENSIONS; i++) {
                int idx = (i * 8) % seed.length;
                buf.clear();
                for (int j = 0; j < 8; j++) {
                    buf.put(seed[(idx + j) % seed.length]);
                }
                buf.flip();
                long bits = buf.getLong();
                // map to [-1, 1] deterministically
                out[i] = ((double) bits / (double) Long.MAX_VALUE);
                if (Double.isNaN(out[i])) out[i] = 0.0;
            }
            return out;
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
