package com.ahmed.ecommerce.similarity;

import com.ahmed.ecommerce.common.NotFoundException;
import com.ahmed.ecommerce.product.Product;
import com.ahmed.ecommerce.product.ProductMapper;
import com.ahmed.ecommerce.product.ProductRepository;
import com.ahmed.ecommerce.product.dto.ProductSummaryDto;
import com.ahmed.ecommerce.product.dto.ProductVectorDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;

/**
 * Top-K similar products via bounded min-heap over cosine similarity.
 * Reads vectors with a JPQL constructor expression so we never serialize
 * a {@code double[]} through a Spring Data interface projection (which is
 * fragile under PostgreSQL's array driver).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SimilarityService {

    public static final int DEFAULT_LIMIT = 8;
    public static final int MAX_LIMIT = 24;

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public List<ProductSummaryDto> findSimilar(long productId, int limit) {
        int k = Math.min(Math.max(limit, 1), MAX_LIMIT);
        Product source = productRepository.findWithCategoryById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found: " + productId));
        if (source.isDraft()) {
            throw new NotFoundException("Product not found: " + productId);
        }
        if (source.getImageVector() == null) {
            return List.of();
        }
        double[] q = source.getImageVector();
        List<ProductVectorDto> candidates = productRepository.findVectorsExcept(productId);

        // Bounded min-heap: keep the k highest-similarity items by ejecting the
        // smallest of the current top-k once the heap is full. O(N log k) total.
        PriorityQueue<Scored> heap = new PriorityQueue<>(k, Comparator.comparingDouble(Scored::score));
        for (ProductVectorDto v : candidates) {
            double s = CosineSimilarity.of(q, v.vector());
            if (heap.size() < k) {
                heap.add(new Scored(v.id(), s));
            } else if (s > heap.peek().score()) {
                heap.poll();
                heap.add(new Scored(v.id(), s));
            }
        }

        List<Scored> ranked = new ArrayList<>(heap);
        ranked.sort(Comparator.comparingDouble(Scored::score).reversed());
        List<Long> ids = ranked.stream().map(Scored::id).toList();
        if (ids.isEmpty()) return List.of();
        // Preserve heap-order, fetch entities in one go.
        List<Product> products = productRepository.findAllByIdInAndDraftFalse(ids);
        // Re-sort by similarity (the IN query loses ordering).
        return ids.stream()
                .map(id -> products.stream().filter(p -> p.getId().equals(id)).findFirst().orElse(null))
                .filter(p -> p != null)
                .map(productMapper::toSummary)
                .toList();
    }

    private record Scored(long id, double score) {
    }
}
