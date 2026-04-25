package com.ahmed.ecommerce.ai;

public interface EmbeddingService {
    double[] embed(byte[] image);

    int dim();
}
