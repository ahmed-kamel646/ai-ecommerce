package com.ahmed.ecommerce.category;

import com.ahmed.ecommerce.category.dto.CategoryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryDto> listAll() {
        return categoryRepository.findAll(Sort.by("name").ascending()).stream()
                .map(c -> new CategoryDto(c.getId(), c.getName()))
                .toList();
    }
}
