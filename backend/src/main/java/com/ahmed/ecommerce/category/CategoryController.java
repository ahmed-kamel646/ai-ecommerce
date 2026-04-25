package com.ahmed.ecommerce.category;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryRepository categoryRepository;

    @GetMapping
    public List<Category> getAll() {
        return categoryRepository.findAll();
    }
}
