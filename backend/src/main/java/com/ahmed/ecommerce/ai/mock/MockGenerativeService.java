package com.ahmed.ecommerce.ai.mock;

import com.ahmed.ecommerce.ai.DraftResult;
import com.ahmed.ecommerce.ai.GenerativeService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(prefix = "ai", name = "provider", havingValue = "mock", matchIfMissing = true)
public class MockGenerativeService implements GenerativeService {

    @Override
    public DraftResult generateDraft(String name, String categoryName, byte[] imageBytes) {
        String safeName = name == null ? "Product" : name;
        String safeCategory = (categoryName == null || categoryName.isBlank()) ? "general" : categoryName;
        String description = String.format(
                "Discover the %s — a quality %s product hand-picked for everyday value. "
                        + "Designed with a balance of style and reliability, it makes a great addition to any "
                        + "%s collection.",
                safeName, safeCategory, safeCategory.toLowerCase());
        String tags = String.join(",",
                slug(safeName),
                slug(safeCategory),
                "buy-online",
                "best-deal",
                "fast-shipping");
        return new DraftResult(description, tags);
    }

    private static String slug(String s) {
        return s.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }
}
