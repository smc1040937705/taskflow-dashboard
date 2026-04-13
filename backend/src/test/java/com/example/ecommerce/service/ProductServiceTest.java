package com.example.ecommerce.service;

import com.example.ecommerce.entity.Product;
import com.example.ecommerce.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product testProduct;

    @BeforeEach
    void setUp() {
        testProduct = Product.builder()
                .id(1L)
                .name("Test Product")
                .description("Test Description")
                .price(BigDecimal.valueOf(100))
                .stock(10)
                .category("Electronics")
                .active(true)
                .build();
    }

    @Test
    @DisplayName("创建商品 - 成功")
    void createProduct_Success() {
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        Product result = productService.createProduct(testProduct);

        assertNotNull(result);
        assertEquals("Test Product", result.getName());
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("获取商品 - 成功")
    void getProductById_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        Optional<Product> result = productService.getProductById(1L);

        assertTrue(result.isPresent());
        assertEquals("Test Product", result.get().getName());
    }

    @Test
    @DisplayName("获取商品 - 不存在")
    void getProductById_NotFound() {
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        Optional<Product> result = productService.getProductById(1L);

        assertFalse(result.isPresent());
    }

    @Test
    @DisplayName("获取所有商品")
    void getAllProducts_Success() {
        when(productRepository.findByActiveTrue()).thenReturn(Arrays.asList(testProduct));

        List<Product> result = productService.getAllProducts();

        assertEquals(1, result.size());
        assertEquals("Test Product", result.get(0).getName());
    }

    @Test
    @DisplayName("按分类获取商品")
    void getProductsByCategory_Success() {
        when(productRepository.findByCategory("Electronics")).thenReturn(Arrays.asList(testProduct));

        List<Product> result = productService.getProductsByCategory("Electronics");

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("搜索商品")
    void searchProducts_Success() {
        when(productRepository.searchByKeyword("test")).thenReturn(Arrays.asList(testProduct));

        List<Product> result = productService.searchProducts("test");

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("更新商品 - 成功")
    void updateProduct_Success() {
        Product updatedDetails = Product.builder()
                .name("Updated Product")
                .description("Updated Description")
                .price(BigDecimal.valueOf(150))
                .stock(20)
                .category("Books")
                .imageUrl("http://example.com/image.jpg")
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        Product result = productService.updateProduct(1L, updatedDetails);

        assertNotNull(result);
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("更新商品 - 不存在")
    void updateProduct_NotFound() {
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            productService.updateProduct(1L, testProduct);
        });

        assertEquals("Product not found", exception.getMessage());
    }

    @Test
    @DisplayName("删除商品 - 成功")
    void deleteProduct_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        assertDoesNotThrow(() -> productService.deleteProduct(1L));
        
        verify(productRepository, times(1)).save(any(Product.class));
        assertFalse(testProduct.getActive());
    }

    @Test
    @DisplayName("删除商品 - 不存在")
    void deleteProduct_NotFound() {
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            productService.deleteProduct(1L);
        });

        assertEquals("Product not found", exception.getMessage());
    }

    @Test
    @DisplayName("更新库存 - 成功")
    void updateStock_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        productService.updateStock(1L, 5);

        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("更新库存 - 库存不足")
    void updateStock_InsufficientStock() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            productService.updateStock(1L, -20);
        });

        assertEquals("Insufficient stock", exception.getMessage());
    }

    @Test
    @DisplayName("更新库存 - 商品不存在")
    void updateStock_ProductNotFound() {
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            productService.updateStock(1L, 5);
        });

        assertEquals("Product not found", exception.getMessage());
    }

    @Test
    @DisplayName("按价格范围获取商品")
    void getProductsByPriceRange_Success() {
        when(productRepository.findByPriceRange(BigDecimal.valueOf(50), BigDecimal.valueOf(200)))
                .thenReturn(Arrays.asList(testProduct));

        List<Product> result = productService.getProductsByPriceRange(
                BigDecimal.valueOf(50), BigDecimal.valueOf(200));

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("获取畅销商品")
    void getBestSelling_Success() {
        when(productRepository.findTopSelling()).thenReturn(Arrays.asList(testProduct));

        List<Product> result = productService.getBestSelling(5);

        assertEquals(1, result.size());
    }
}