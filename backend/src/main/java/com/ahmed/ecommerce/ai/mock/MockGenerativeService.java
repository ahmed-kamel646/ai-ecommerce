package com.ahmed.ecommerce.ai.mock;

import com.ahmed.ecommerce.ai.DraftResult;
import com.ahmed.ecommerce.ai.GenerativeService;
import java.util.List;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "ai.provider", havingValue = "mock", matchIfMissing = true)
public class MockGenerativeService implements GenerativeService {

    @Override
    public DraftResult draft(String productName, String categoryName) {
        String description =
                String.format(
                        "A high-quality %s item: %s. Crafted for everyday use with a modern look.",
                        categoryName, productName);
        String slug = productName.toLowerCase().replaceAll("[^a-z0-9]+", "-");
        String catSlug = categoryName.toLowerCase().replaceAll("[^a-z0-9]+", "-");
        List<String> tags = List.of(slug, catSlug, "new-arrival", "trending", "best-seller");
        return new DraftResult(description, tags);
    }
}
