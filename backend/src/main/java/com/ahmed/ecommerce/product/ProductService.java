package com.ahmed.ecommerce.product;

import com.ahmed.ecommerce.category.Category;
import com.ahmed.ecommerce.category.CategoryRepository;
import com.ahmed.ecommerce.common.NotFoundException;
import com.ahmed.ecommerce.product.dto.ProductDetailDto;
import com.ahmed.ecommerce.product.dto.ProductSummaryDto;
import com.ahmed.ecommerce.product.dto.ProductUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Read-only catalog operations (admin write/AI-orchestrated create lives in
 * the AI-aware ProductService that ships with the AI orchestration PR).
 *
 * <p>Class-level {@code @Transactional(readOnly=true)} per Rule 1 — service
 * boundary owns the tx so lazy associations resolve before the controller
 * marshals the DTO.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    public static final int MAX_PAGE_SIZE = 50;

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper mapper;

    public Page<ProductSummaryDto> findFiltered(String search,
                                                Long categoryId,
                                                String sort,
                                                int page,
                                                int size) {
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        int safePage = Math.max(page, 0);
        String trimmed = (search == null || search.isBlank()) ? null : search.trim();
        Pageable pageable = PageRequest.of(safePage, safeSize, sortFor(sort));
        return productRepository.findFiltered(trimmed, categoryId, pageable)
                .map(mapper::toSummary);
    }

    public ProductDetailDto findById(Long id) {
        return productRepository.findWithCategoryById(id)
                .map(mapper::toDetail)
                .orElseThrow(() -> new NotFoundException("Product not found: " + id));
    }

    public Product getEntity(Long id) {
        return productRepository.findWithCategoryById(id)
                .orElseThrow(() -> new NotFoundException("Product not found: " + id));
    }

    public List<ProductSummaryDto> findBatch(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return List.of();
        return productRepository.findAllByIdInAndDraftFalse(ids).stream()
                .map(mapper::toSummary)
                .toList();
    }

    @Transactional
    public ProductDetailDto update(Long id, ProductUpdateRequest req) {
        Product p = productRepository.findWithCategoryById(id)
                .orElseThrow(() -> new NotFoundException("Product not found: " + id));
        if (req.getName() != null) p.setName(req.getName());
        if (req.getDescription() != null) p.setDescription(req.getDescription());
        if (req.getPrice() != null) p.setPrice(req.getPrice());
        if (req.getStock() != null) p.setStock(req.getStock());
        if (req.getSeoTags() != null) p.setSeoTags(req.getSeoTags());
        if (req.getDraft() != null) p.setDraft(req.getDraft());
        if (req.getCategoryId() != null) {
            Category cat = categoryRepository.findById(req.getCategoryId())
                    .orElseThrow(() -> new NotFoundException("Category not found: " + req.getCategoryId()));
            p.setCategory(cat);
        }
        return mapper.toDetail(p);
    }

    @Transactional
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new NotFoundException("Product not found: " + id);
        }
        productRepository.deleteById(id);
    }

    private Sort sortFor(String sort) {
        if (sort == null) return Sort.by(Sort.Order.desc("createdAt"));
        return switch (sort) {
            case "newest" -> Sort.by(Sort.Order.desc("createdAt"));
            case "priceAsc" -> Sort.by(Sort.Order.asc("price"));
            case "priceDesc" -> Sort.by(Sort.Order.desc("price"));
            case "popular" -> Sort.by(Sort.Order.desc("soldCount"), Sort.Order.desc("createdAt"));
            default -> Sort.by(Sort.Order.desc("createdAt"));
        };
    }
}
