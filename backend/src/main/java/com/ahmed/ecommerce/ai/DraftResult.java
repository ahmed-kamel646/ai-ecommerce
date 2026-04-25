package com.ahmed.ecommerce.ai;

public record DraftResult(String description, String seoTagsCsv) {
    public static DraftResult empty() {
        return new DraftResult("", "");
    }
}
