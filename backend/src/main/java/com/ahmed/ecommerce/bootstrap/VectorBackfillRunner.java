package com.ahmed.ecommerce.bootstrap;

import com.ahmed.ecommerce.ai.EmbeddingService;
import com.ahmed.ecommerce.product.Product;
import com.ahmed.ecommerce.product.ProductRepository;
import java.io.InputStream;
import java.net.URL;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class VectorBackfillRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(VectorBackfillRunner.class);

    private final ProductRepository productRepository;
    private final EmbeddingService embeddingService;

    @Value("${ai.provider:mock}")
    private String aiProvider;

    @Override
    public void run(ApplicationArguments args) {
        List<Product> productsToBackfill =
                productRepository.findAll().stream()
                        .filter(p -> p.getImageVector() == null)
                        .toList();

        if (productsToBackfill.isEmpty()) {
            return;
        }

        int count = 0;
        for (Product product : productsToBackfill) {
            try {
                byte[] imageBytes = downloadImage(product.getImageUrl());
                double[] vector = embeddingService.embed(imageBytes);
                product.setImageVector(vector);
                productRepository.save(product);
                count++;
            } catch (Exception e) {
                log.error("Failed to backfill vector for product ID: {}", product.getId(), e);
            }
        }

        log.info("Backfilled {} product vectors using provider={}", count, aiProvider);
    }

    private byte[] downloadImage(String imageUrl) throws Exception {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return new byte[0];
        }
        if (imageUrl.startsWith("http")) {
            try (InputStream in = new URL(imageUrl).openStream()) {
                return in.readAllBytes();
            }
        } else {
            return new byte[0];
        }
    }
}
