package com.ahmed.ecommerce.product;

import com.ahmed.ecommerce.product.dto.ProductDetailDto;
import com.ahmed.ecommerce.product.dto.ProductDraftDto;
import com.ahmed.ecommerce.product.dto.ProductSummaryDto;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "categoryName", source = "category.name")
    ProductSummaryDto toSummaryDto(Product product);

    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "seoTags", source = "seoTags", qualifiedByName = "stringToList")
    ProductDetailDto toDetailDto(Product product);

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "seoTags", source = "seoTags", qualifiedByName = "stringToList")
    @Mapping(target = "draft", ignore = true)
    ProductDraftDto toDraftDto(Product product);

    @Named("stringToList")
    default List<String> stringToList(String tags) {
        if (tags == null || tags.trim().isEmpty()) {
            return List.of();
        }
        return Arrays.stream(tags.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }
}
