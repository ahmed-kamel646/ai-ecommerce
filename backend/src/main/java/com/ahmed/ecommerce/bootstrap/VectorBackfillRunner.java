package com.ahmed.ecommerce.bootstrap;

import com.ahmed.ecommerce.ai.EmbeddingService;
import com.ahmed.ecommerce.product.ProductPersistenceService;
import com.ahmed.ecommerce.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

/**
 * On startup, embed any product whose {@code image_vector} is NULL — this is
 * how the seed data and any draft that survived an AI failure get vectors.
 *
 * <p>NOT {@code @Transactional}: this would violate Rule 4 (AI work inside a
 * transaction). Each per-product write happens in its own short tx via
 * {@link ProductPersistenceService#setVector(Long, double[])}.
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class VectorBackfillRunner implements ApplicationRunner {

    private final ProductRepository productRepository;
    private final ProductPersistenceService persistence;
    private final EmbeddingService embeddingService;

    @Value("${app.bootstrap.use-deterministic-vectors:false}")
    private boolean useDeterministic;

    @Value("${app.uploads.dir:./uploads}")
    private String uploadsDir;

    @Override
    public void run(ApplicationArguments args) {
        List<Long> ids = productRepository.findIdsByImageVectorIsNull();
        if (ids.isEmpty()) {
            return;
        }
        log.info("VectorBackfillRunner: embedding {} products with NULL vectors", ids.size());
        for (Long id : ids) {
            try {
                productRepository.findById(id).ifPresent(p -> {
                    byte[] bytes = useDeterministic
                            ? deterministicSeed(p.getId(), p.getName())
                            : loadImageBytes(p.getImageUrl());
                    double[] vector = embeddingService.embedImage(bytes, "image/png");
                    if (vector != null) {
                        persistence.setVector(p.getId(), vector);
                    }
                });
            } catch (Exception e) {
                log.warn("Backfill failed for product {}: {}", id, e.getMessage());
            }
        }
    }

    private byte[] deterministicSeed(Long id, String name) {
        String s = "product-" + id + "-" + (name == null ? "" : name);
        return s.getBytes();
    }

    private byte[] loadImageBytes(String url) {
        if (url == null || url.isBlank()) return new byte[0];
        try {
            if (url.startsWith("/files/")) {
                Path path = Paths.get(uploadsDir, url.substring("/files/".length()))
                        .toAbsolutePath().normalize();
                if (Files.exists(path)) {
                    return Files.readAllBytes(path);
                }
                return new byte[0];
            }
            URL u = URI.create(url).toURL();
            try (InputStream in = u.openStream()) {
                return in.readAllBytes();
            }
        } catch (IOException e) {
            log.debug("Could not load image {}: {}", url, e.getMessage());
            return new byte[0];
        }
    }
}
