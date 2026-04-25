package com.ahmed.ecommerce.ai;

public interface GenerativeService {
    DraftResult draft(String productName, String categoryName);
}
