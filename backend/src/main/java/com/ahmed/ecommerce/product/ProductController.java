package com.ahmed.ecommerce.product;

import com.ahmed.ecommerce.common.PageResponse;
import com.ahmed.ecommerce.product.dto.ProductDetailDto;
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
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public PageResponse<ProductSummaryDto> list(@RequestParam(required = false) String search,
                                                @RequestParam(required = false) Long categoryId,
                                                @RequestParam(defaultValue = "newest") String sort,
                                                @RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "12") int size) {
        return PageResponse.of(productService.findFiltered(search, categoryId, sort, page, size));
    }

    @GetMapping("/{id}")
    public ProductDetailDto detail(@PathVariable Long id) {
        return productService.findById(id);
    }

    @GetMapping("/batch")
    public List<ProductSummaryDto> batch(@RequestParam List<Long> ids) {
        return productService.findBatch(ids);
    }
}
