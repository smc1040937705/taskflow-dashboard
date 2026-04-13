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
@DisplayName("Product Service Tests")
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
                .price(new BigDecimal("100.00"))
                .stock(10)
                .category("Electronics")
                .imageUrl("http://example.com/image.jpg")
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Should create product successfully")
    void createProduct_Success() {
        // Given
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        // When
        Product result = productService.createProduct(testProduct);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Test Product", result.getName());
        verify(productRepository).save(testProduct);
    }

    @Test
    @DisplayName("Should get product by ID successfully")
    void getProductById_Success() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        // When
        Optional<Product> result = productService.getProductById(1L);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testProduct, result.get());
    }

    @Test
    @DisplayName("Should return empty optional when product not found")
    void getProductById_NotFound() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        // When
        Optional<Product> result = productService.getProductById(1L);

        // Then
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Should get all active products")
    void getAllProducts_Success() {
        // Given
        List<Product> products = Arrays.asList(testProduct);
        when(productRepository.findByActiveTrue()).thenReturn(products);

        // When
        List<Product> result = productService.getAllProducts();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testProduct, result.get(0));
    }

    @Test
    @DisplayName("Should return empty list when no active products")
    void getAllProducts_Empty() {
        // Given
        when(productRepository.findByActiveTrue()).thenReturn(Arrays.asList());

        // When
        List<Product> result = productService.getAllProducts();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Should get products by category")
    void getProductsByCategory_Success() {
        // Given
        List<Product> products = Arrays.asList(testProduct);
        when(productRepository.findByCategory("Electronics")).thenReturn(products);

        // When
        List<Product> result = productService.getProductsByCategory("Electronics");

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Electronics", result.get(0).getCategory());
    }

    @Test
    @DisplayName("Should search products by keyword")
    void searchProducts_Success() {
        // Given
        List<Product> products = Arrays.asList(testProduct);
        when(productRepository.searchByKeyword("Test")).thenReturn(products);

        // When
        List<Product> result = productService.searchProducts("Test");

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(productRepository).searchByKeyword("Test");
    }

    @Test
    @DisplayName("Should update product successfully")
    void updateProduct_Success() {
        // Given
        Product updatedDetails = Product.builder()
                .name("Updated Product")
                .description("Updated Description")
                .price(new BigDecimal("150.00"))
                .stock(20)
                .category("Updated Category")
                .imageUrl("http://example.com/updated.jpg")
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        Product result = productService.updateProduct(1L, updatedDetails);

        // Then
        assertEquals("Updated Product", result.getName());
        assertEquals("Updated Description", result.getDescription());
        assertEquals(new BigDecimal("150.00"), result.getPrice());
        assertEquals(20, result.getStock());
        assertEquals("Updated Category", result.getCategory());
        assertEquals("http://example.com/updated.jpg", result.getImageUrl());
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent product")
    void updateProduct_NotFound() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> productService.updateProduct(1L, testProduct));
        assertEquals("Product not found", exception.getMessage());
    }

    @Test
    @DisplayName("Should delete product by setting active to false")
    void deleteProduct_Success() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        productService.deleteProduct(1L);

        // Then
        assertFalse(testProduct.getActive());
        verify(productRepository).save(testProduct);
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent product")
    void deleteProduct_NotFound() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> productService.deleteProduct(1L));
        assertEquals("Product not found", exception.getMessage());
    }

    @Test
    @DisplayName("Should update stock successfully when adding quantity")
    void updateStock_AddQuantity() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        productService.updateStock(1L, 5);

        // Then
        assertEquals(15, testProduct.getStock()); // 10 + 5 = 15
        verify(productRepository).save(testProduct);
    }

    @Test
    @DisplayName("Should update stock successfully when removing quantity")
    void updateStock_RemoveQuantity() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        productService.updateStock(1L, -5);

        // Then
        assertEquals(5, testProduct.getStock()); // 10 - 5 = 5
        verify(productRepository).save(testProduct);
    }

    @Test
    @DisplayName("Should throw exception when stock becomes negative")
    void updateStock_InsufficientStock() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> productService.updateStock(1L, -15));
        assertEquals("Insufficient stock", exception.getMessage());
        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when updating stock of non-existent product")
    void updateStock_ProductNotFound() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> productService.updateStock(1L, 5));
        assertEquals("Product not found", exception.getMessage());
    }

    @Test
    @DisplayName("Should get products by price range")
    void getProductsByPriceRange_Success() {
        // Given
        List<Product> products = Arrays.asList(testProduct);
        BigDecimal minPrice = new BigDecimal("50.00");
        BigDecimal maxPrice = new BigDecimal("150.00");
        when(productRepository.findByPriceRange(minPrice, maxPrice)).thenReturn(products);

        // When
        List<Product> result = productService.getProductsByPriceRange(minPrice, maxPrice);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(productRepository).findByPriceRange(minPrice, maxPrice);
    }

    @Test
    @DisplayName("Should get best selling products")
    void getBestSelling_Success() {
        // Given
        Product product2 = Product.builder()
                .id(2L)
                .name("Product 2")
                .price(new BigDecimal("200.00"))
                .build();
        List<Product> products = Arrays.asList(testProduct, product2);
        when(productRepository.findTopSelling()).thenReturn(products);

        // When
        List<Product> result = productService.getBestSelling(5);

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("Should limit best selling products")
    void getBestSelling_WithLimit() {
        // Given
        Product product2 = Product.builder().id(2L).name("Product 2").build();
        Product product3 = Product.builder().id(3L).name("Product 3").build();
        Product product4 = Product.builder().id(4L).name("Product 4").build();
        List<Product> products = Arrays.asList(testProduct, product2, product3, product4);
        when(productRepository.findTopSelling()).thenReturn(products);

        // When
        List<Product> result = productService.getBestSelling(2);

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
    }
}
