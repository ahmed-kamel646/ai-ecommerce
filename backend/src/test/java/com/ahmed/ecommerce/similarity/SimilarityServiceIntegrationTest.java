package com.ahmed.ecommerce.similarity;

import com.ahmed.ecommerce.AbstractIntegrationTest;
import com.ahmed.ecommerce.product.Product;
import com.ahmed.ecommerce.product.ProductRepository;
import com.ahmed.ecommerce.product.dto.ProductSummaryDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class SimilarityServiceIntegrationTest extends AbstractIntegrationTest {

    @Autowired SimilarityService similarityService;
    @Autowired ProductRepository productRepository;

    @Test
    void findSimilarReturnsAtMostKAndSourceExcluded() {
        Product source = productRepository.findAll().stream()
                .filter(p -> p.getImageVector() != null)
                .findFirst()
                .orElseThrow();
        List<ProductSummaryDto> similar = similarityService.findSimilar(source.getId(), 5);
        assertThat(similar).hasSizeLessThanOrEqualTo(5);
        assertThat(similar).noneMatch(p -> p.id().equals(source.getId()));
    }

    @Test
    void findSimilarHandlesProductWithoutVector() {
        Product noVector = productRepository.findAll().stream()
                .filter(p -> p.getImageVector() == null)
                .findFirst()
                .orElse(null);
        if (noVector != null) {
            List<ProductSummaryDto> similar = similarityService.findSimilar(noVector.getId(), 5);
            assertThat(similar).isEmpty();
        }
    }

    @Test
    void cosineOfIdenticalIsOne() {
        double[] v = new double[]{1.0, 2.0, 3.0};
        assertThat(CosineSimilarity.of(v, v)).isCloseTo(1.0, org.assertj.core.data.Offset.offset(1e-9));
    }

    @Test
    void cosineOfOrthogonalIsZero() {
        assertThat(CosineSimilarity.of(new double[]{1, 0}, new double[]{0, 1}))
                .isCloseTo(0.0, org.assertj.core.data.Offset.offset(1e-9));
    }
}
