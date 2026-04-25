package com.ahmed.ecommerce.product;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ahmed.ecommerce.auth.JwtService;
import com.ahmed.ecommerce.product.dto.ProductSummaryDto;
import com.ahmed.ecommerce.similarity.RecommendationService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ProductController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security filters for this test
class ProductControllerWebMvcTest {

    @Autowired private MockMvc mockMvc;

    @MockBean private ProductRepository productRepository;
    @MockBean private ProductMapper productMapper;
    @MockBean private ProductService productService;
    @MockBean private RecommendationService recommendationService;
    @MockBean private JwtService jwtService;

    @Test
    void testGetProductsPaged() throws Exception {
        Product p = new Product();
        Page<Product> page = new PageImpl<>(List.of(p));
        when(productRepository.findFiltered(isNull(), isNull(), any(Pageable.class)))
                .thenReturn(page);

        ProductSummaryDto dto = new ProductSummaryDto();
        dto.setName("Test");
        when(productMapper.toSummaryDto(any())).thenReturn(dto);

        mockMvc.perform(get("/api/products?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Test"))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void testGetSimilar() throws Exception {
        Product p = new Product();
        when(recommendationService.getSimilarProducts(anyLong(), anyInt())).thenReturn(List.of(p));

        ProductSummaryDto dto = new ProductSummaryDto();
        dto.setName("Similar");
        when(productMapper.toSummaryDto(any())).thenReturn(dto);

        mockMvc.perform(get("/api/products/1/similar?limit=6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Similar"));
    }
}
