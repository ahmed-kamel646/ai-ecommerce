package com.ahmed.ecommerce.product;

import com.ahmed.ecommerce.ai.DraftResult;
import com.ahmed.ecommerce.common.PageResponse;
import com.ahmed.ecommerce.product.dto.ProductDetailDto;
import com.ahmed.ecommerce.product.dto.ProductDraftDto;
import com.ahmed.ecommerce.product.dto.ProductRequest;
import com.ahmed.ecommerce.product.dto.ProductSummaryDto;
import com.ahmed.ecommerce.similarity.RecommendationService;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class ProductController {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final ProductService productService;
    private final RecommendationService recommendationService;

    // Public endpoints

    @GetMapping("/api/products")
    public PageResponse<ProductSummaryDto> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Page<Product> productPage =
                productRepository.findFiltered(categoryId, search, PageRequest.of(page, size));
        return PageResponse.of(productPage.map(productMapper::toSummaryDto));
    }

    @GetMapping("/api/products/{id}")
    public ProductDetailDto getProduct(@PathVariable Long id) {
        return productRepository
                .findById(id)
                .map(productMapper::toDetailDto)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
    }

    @GetMapping("/api/products/{id}/similar")
    public List<ProductSummaryDto> getSimilarProducts(
            @PathVariable Long id, @RequestParam(defaultValue = "6") int limit) {
        return recommendationService.getSimilarProducts(id, limit).stream()
                .map(productMapper::toSummaryDto)
                .toList();
    }

    // Admin endpoints

    @PostMapping(value = "/api/admin/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDraftDto> createProduct(
            @RequestPart("image") MultipartFile image,
            @Valid @ModelAttribute ProductRequest request) {

        ProductDraftDto draftDto = productService.saveDraftPlaceholder(image, request);
        Product finalProduct = productRepository.findById(draftDto.getId()).orElseThrow();

        try {
            byte[] imageBytes = image != null ? image.getBytes() : null;
            productService.attachAiResults(
                    draftDto.getId(),
                    imageBytes,
                    request.getName(),
                    finalProduct.getCategory().getName());
        } catch (IOException e) {
            throw new RuntimeException("Failed to read image bytes", e);
        }

        finalProduct = productRepository.findById(draftDto.getId()).orElseThrow();
        ProductDraftDto resultDto = productMapper.toDraftDto(finalProduct);
        resultDto.setDraft(!Boolean.TRUE.equals(request.getAutoApprove()));

        return ResponseEntity.status(HttpStatus.CREATED).body(resultDto);
    }

    @PutMapping(value = "/api/admin/products/{id}")
    public ResponseEntity<ProductDraftDto> updateProduct(
            @PathVariable Long id,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Double price,
            @RequestParam(required = false) Integer stock,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String seoTags,
            @RequestBody(required = false) ProductDraftDto jsonUpdateReq) {

        ProductDraftDto payload = jsonUpdateReq != null ? jsonUpdateReq : new ProductDraftDto();
        if (jsonUpdateReq == null) {
            payload.setName(name);
            payload.setPrice(price);
            payload.setStock(stock);
            payload.setCategoryId(categoryId);
            payload.setDescription(description);
            if (seoTags != null && !seoTags.isBlank()) {
                payload.setSeoTags(java.util.Arrays.asList(seoTags.split(",")));
            }
        }

        Product updated = productService.updateProduct(id, payload);

        if (image != null && !image.isEmpty()) {
            try {
                productService.attachAiResults(
                        id, image.getBytes(), updated.getName(), updated.getCategory().getName());
                updated = productRepository.findById(id).orElseThrow();
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }

        ProductDraftDto resultDto = productMapper.toDraftDto(updated);
        resultDto.setDraft(false);
        return ResponseEntity.ok(resultDto);
    }

    @DeleteMapping("/api/admin/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/admin/products/{id}/regenerate-text")
    public DraftResult regenerateText(@PathVariable Long id) {
        return productService.regenerateText(id);
    }
}
