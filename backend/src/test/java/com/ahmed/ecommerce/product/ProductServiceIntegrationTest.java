package com.ahmed.ecommerce.product;

import com.ahmed.ecommerce.AbstractIntegrationTest;
import com.ahmed.ecommerce.product.dto.ProductDetailDto;
import com.ahmed.ecommerce.product.dto.ProductSummaryDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ProductServiceIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    ProductService productService;

    @Test
    void listsSeedProductsByDefault() {
        Page<ProductSummaryDto> page = productService.findFiltered(null, null, "newest", 0, 12);
        assertThat(page.getTotalElements()).isEqualTo(12);
        assertThat(page.getContent().get(0).name()).isNotNull();
        assertThat(page.getContent().get(0).categoryName()).isNotNull();
    }

    @Test
    void searchIsCaseInsensitive() {
        Page<ProductSummaryDto> page = productService.findFiltered("PHONE", null, "newest", 0, 12);
        assertThat(page.getContent()).extracting(ProductSummaryDto::name)
                .anyMatch(n -> n.toLowerCase().contains("phone"));
    }

    @Test
    void priceAscSorts() {
        Page<ProductSummaryDto> page = productService.findFiltered(null, null, "priceAsc", 0, 12);
        assertThat(page.getContent()).isSortedAccordingTo(
                (a, b) -> a.price().compareTo(b.price()));
    }

    @Test
    void detailEagerLoadsCategoryWithoutLazyInit() {
        Page<ProductSummaryDto> page = productService.findFiltered(null, null, "newest", 0, 1);
        Long firstId = page.getContent().get(0).id();
        ProductDetailDto detail = productService.findById(firstId);
        assertThat(detail.categoryName()).isNotNull();
        assertThat(detail.description()).isNotNull();
    }

    @Test
    void batchReturnsAllRequestedNonDraftProducts() {
        Page<ProductSummaryDto> page = productService.findFiltered(null, null, "newest", 0, 5);
        List<Long> ids = page.getContent().stream().map(ProductSummaryDto::id).toList();
        List<ProductSummaryDto> batch = productService.findBatch(ids);
        assertThat(batch).hasSize(ids.size());
    }
}
