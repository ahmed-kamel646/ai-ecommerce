package com.ahmed.ecommerce.similarity;

import com.ahmed.ecommerce.product.Product;
import com.ahmed.ecommerce.product.ProductRepository;
import com.ahmed.ecommerce.product.ProductVectorDto;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final ProductRepository productRepository;

    public List<Product> getSimilarProducts(long productId, int limit) {
        Product source = productRepository.findById(productId).orElseThrow();
        double[] sourceVector = source.getImageVector();

        if (sourceVector == null || sourceVector.length == 0) {
            return List.of();
        }

        List<ProductVectorDto> candidates = productRepository.findAllVectorsExcept(productId);

        PriorityQueue<ScoredId> minHeap =
                new PriorityQueue<>(Comparator.comparingDouble(ScoredId::score));

        for (ProductVectorDto candidate : candidates) {
            double score = CosineSimilarity.cosine(sourceVector, candidate.vector());
            minHeap.offer(new ScoredId(candidate.id(), score));
            if (minHeap.size() > limit) {
                minHeap.poll();
            }
        }

        List<ScoredId> top = new ArrayList<>();
        while (!minHeap.isEmpty()) {
            top.add(minHeap.poll());
        }
        Collections.reverse(top);

        List<Long> orderedIds = top.stream().map(ScoredId::id).toList();

        if (orderedIds.isEmpty()) return List.of();

        List<Product> fetched = productRepository.findAllById(orderedIds);
        Map<Long, Product> productMap =
                fetched.stream().collect(Collectors.toMap(Product::getId, p -> p));

        return orderedIds.stream().map(productMap::get).filter(java.util.Objects::nonNull).toList();
    }

    public record ScoredId(long id, double score) {}
}
