package com.ahmed.ecommerce.similarity;

import com.ahmed.ecommerce.product.dto.ProductSummaryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class SimilarityController {

    private final SimilarityService similarityService;

    @GetMapping("/{id}/similar")
    public List<ProductSummaryDto> similar(@PathVariable long id,
                                            @RequestParam(defaultValue = "8") int limit) {
        return similarityService.findSimilar(id, limit);
    }
}
