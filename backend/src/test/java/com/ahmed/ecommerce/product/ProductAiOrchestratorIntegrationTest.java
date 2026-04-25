package com.ahmed.ecommerce.product;

import com.ahmed.ecommerce.AbstractIntegrationTest;
import com.ahmed.ecommerce.category.CategoryRepository;
import com.ahmed.ecommerce.product.dto.ProductDraftDto;
import com.ahmed.ecommerce.product.dto.ProductDraftRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class ProductAiOrchestratorIntegrationTest extends AbstractIntegrationTest {

    @Autowired ProductAiOrchestrator orchestrator;
    @Autowired ProductRepository productRepository;
    @Autowired CategoryRepository categoryRepository;

    @Test
    void mockOrchestrationWritesDescriptionTagsAndVector() {
        Long catId = categoryRepository.findAll().get(0).getId();
        byte[] fakeImage = new byte[]{1, 2, 3, 4, 5};
        MockMultipartFile mp = new MockMultipartFile(
                "image", "test.png", "image/png", fakeImage);
        ProductDraftDto draft = orchestrator.createDraft(
                new ProductDraftRequest("AI Test Widget", new BigDecimal("19.99"), 10, catId),
                mp);

        Product saved = productRepository.findWithCategoryById(draft.id()).orElseThrow();
        assertThat(saved.getDescription()).isNotBlank();
        assertThat(saved.getSeoTags()).isNotBlank();
        assertThat(saved.getImageVector()).isNotNull();
        assertThat(saved.getImageVector().length).isEqualTo(1408);
        assertThat(saved.isDraft()).isFalse();
    }
}
