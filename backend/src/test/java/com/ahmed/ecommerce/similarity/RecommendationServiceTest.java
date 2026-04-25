package com.ahmed.ecommerce.similarity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.ahmed.ecommerce.product.Product;
import com.ahmed.ecommerce.product.ProductRepository;
import com.ahmed.ecommerce.product.ProductVectorDto;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {

    @Mock private ProductRepository productRepository;

    @InjectMocks private RecommendationService recommendationService;

    @Test
    void testGetSimilarProducts() {
        long sourceId = 1L;
        Product source = new Product();
        source.setId(sourceId);
        source.setImageVector(new double[] {1.0, 0.0, 0.0});

        Product p2 = new Product();
        p2.setId(2L);
        Product p3 = new Product();
        p3.setId(3L);
        Product p4 = new Product();
        p4.setId(4L);

        when(productRepository.findById(sourceId)).thenReturn(Optional.of(source));

        // p2 is identical
        // p3 is orthogonal
        // p4 is somewhat similar
        when(productRepository.findAllVectorsExcept(sourceId))
                .thenReturn(
                        List.of(
                                new ProductVectorDto(2L, new double[] {1.0, 0.0, 0.0}),
                                new ProductVectorDto(3L, new double[] {0.0, 1.0, 0.0}),
                                new ProductVectorDto(4L, new double[] {0.5, 0.5, 0.0})));

        when(productRepository.findAllById(List.of(2L, 4L))).thenReturn(List.of(p2, p4));

        List<Product> similar = recommendationService.getSimilarProducts(sourceId, 2);

        assertThat(similar).hasSize(2);
        assertThat(similar.get(0).getId()).isEqualTo(2L);
        assertThat(similar.get(1).getId()).isEqualTo(4L);
    }
}
