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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product testProduct1;
    private Product testProduct2;

    @BeforeEach
    void setUp() {
        testProduct1 = Product.builder()
                .id(1L)
                .name("Product 1")
                .description("Description 1")
                .price(BigDecimal.valueOf(100))
                .stock(10)
                .category("Electronics")
                .active(true)
                .status(Product.ProductStatus.ACTIVE)
                .build();

        testProduct2 = Product.builder()
                .id(2L)
                .name("Product 2")
                .description("Description 2")
                .price(BigDecimal.valueOf(200))
                .stock(5)
                .category("Books")
                .active(true)
                .status(Product.ProductStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("Should create product successfully")
    void createProduct_Success() {
        when(productRepository.save(any(Product.class))).thenReturn(testProduct1);

        Product result = productService.createProduct(testProduct1);

        assertNotNull(result);
        assertEquals("Product 1", result.getName());
        verify(productRepository).save(testProduct1);
    }

    @Test
    @DisplayName("Should get product by id")
    void getProductById_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct1));

        Optional<Product> result = productService.getProductById(1L);

        assertTrue(result.isPresent());
        assertEquals("Product 1", result.get().getName());
    }

    @Test
    @DisplayName("Should return empty when product not found")
    void getProductById_NotFound() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<Product> result = productService.getProductById(999L);

        assertFalse(result.isPresent());
    }

    @Test
    @DisplayName("Should get all active products")
    void getAllProducts_Success() {
        List<Product> products = Arrays.asList(testProduct1, testProduct2);
        when(productRepository.findByActiveTrue()).thenReturn(products);

        List<Product> result = productService.getAllProducts();

        assertNotNull(result);
        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("Should get products by category")
    void getProductsByCategory_Success() {
        List<Product> products = Arrays.asList(testProduct1);
        when(productRepository.findByCategory("Electronics")).thenReturn(products);

        List<Product> result = productService.getProductsByCategory("Electronics");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Electronics", result.get(0).getCategory());
    }

    @Test
    @DisplayName("Should search products by keyword")
    void searchProducts_Success() {
        List<Product> products = Arrays.asList(testProduct1);
        when(productRepository.searchByKeyword("Product 1")).thenReturn(products);

        List<Product> result = productService.searchProducts("Product 1");

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Should update product successfully")
    void updateProduct_Success() {
        Product updatedDetails = Product.builder()
                .name("Updated Product")
                .description("Updated Description")
                .price(BigDecimal.valueOf(150))
                .stock(20)
                .category("Updated Category")
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct1));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct1);

        Product result = productService.updateProduct(1L, updatedDetails);

        assertNotNull(result);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent product")
    void updateProduct_NotFound() {
        Product updatedDetails = Product.builder()
                .name("Updated Product")
                .build();

        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            productService.updateProduct(999L, updatedDetails);
        });

        assertEquals("Product not found", exception.getMessage());
    }

    @Test
    @DisplayName("Should delete product (soft delete)")
    void deleteProduct_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct1));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct1);

        productService.deleteProduct(1L);

        assertFalse(testProduct1.getActive());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent product")
    void deleteProduct_NotFound() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            productService.deleteProduct(999L);
        });

        assertEquals("Product not found", exception.getMessage());
    }

    @Test
    @DisplayName("Should update stock successfully")
    void updateStock_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct1));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct1);

        productService.updateStock(1L, 5);

        assertEquals(15, testProduct1.getStock());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("Should update stock with negative quantity")
    void updateStock_NegativeQuantity() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct1));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct1);

        productService.updateStock(1L, -5);

        assertEquals(5, testProduct1.getStock());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("Should throw exception when stock becomes negative")
    void updateStock_InsufficientStock() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct1));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            productService.updateStock(1L, -20);
        });

        assertEquals("Insufficient stock", exception.getMessage());
        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when updating stock for non-existent product")
    void updateStock_ProductNotFound() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            productService.updateStock(999L, 5);
        });

        assertEquals("Product not found", exception.getMessage());
    }

    @Test
    @DisplayName("Should get products by price range")
    void getProductsByPriceRange_Success() {
        List<Product> products = Arrays.asList(testProduct1, testProduct2);
        when(productRepository.findByPriceRange(BigDecimal.valueOf(50), BigDecimal.valueOf(250)))
                .thenReturn(products);

        List<Product> result = productService.getProductsByPriceRange(
                BigDecimal.valueOf(50), BigDecimal.valueOf(250));

        assertNotNull(result);
        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("Should get best selling products")
    void getBestSelling_Success() {
        List<Product> products = Arrays.asList(testProduct1, testProduct2);
        when(productRepository.findTopSelling()).thenReturn(products);

        List<Product> result = productService.getBestSelling(1);

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Should return empty list when no best selling products")
    void getBestSelling_EmptyList() {
        when(productRepository.findTopSelling()).thenReturn(Arrays.asList());

        List<Product> result = productService.getBestSelling(5);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}
