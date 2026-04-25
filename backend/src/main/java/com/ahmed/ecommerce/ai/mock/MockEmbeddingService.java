package com.ahmed.ecommerce.ai.mock;

import com.ahmed.ecommerce.ai.EmbeddingService;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "ai.provider", havingValue = "mock", matchIfMissing = true)
public class MockEmbeddingService implements EmbeddingService {

    @Override
    public double[] embed(byte[] image) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(image);
            double[] vector = new double[dim()];
            for (int i = 0; i < dim(); i++) {
                // Stretch into [-1, 1] deterministically based on the hash
                int hashByte = hash[i % hash.length] & 0xFF;
                vector[i] = (hashByte / 127.5) - 1.0;
            }
            return vector;
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public int dim() {
        return 1408;
    }
}
