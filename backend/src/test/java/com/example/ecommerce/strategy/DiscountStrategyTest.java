package com.example.ecommerce.strategy;

import com.example.ecommerce.entity.Order;
import com.example.ecommerce.entity.OrderItem;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Discount Strategy Tests")
class DiscountStrategyTest {

    private Order testOrder;
    private User testUser;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        testProduct = Product.builder()
                .id(1L)
                .name("Test Product")
                .price(new BigDecimal("100.00"))
                .build();

        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .loyaltyPoints(0)
                .build();

        testOrder = Order.builder()
                .id(1L)
                .user(testUser)
                .subtotal(new BigDecimal("100.00"))
                .items(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("PercentageDiscountStrategy should calculate 10% discount")
    void percentageDiscountStrategy_CalculateDiscount() {
        // Given
        DiscountStrategy strategy = new PercentageDiscountStrategy();
        testOrder.setSubtotal(new BigDecimal("100.00"));

        // When
        BigDecimal discount = strategy.calculateDiscount(testOrder);

        // Then
        assertEquals(new BigDecimal("10.00"), discount);
        assertEquals("PERCENTAGE", strategy.getType());
    }

    @Test
    @DisplayName("PercentageDiscountStrategy should handle large amounts")
    void percentageDiscountStrategy_LargeAmount() {
        // Given
        DiscountStrategy strategy = new PercentageDiscountStrategy();
        testOrder.setSubtotal(new BigDecimal("1000.00"));

        // When
        BigDecimal discount = strategy.calculateDiscount(testOrder);

        // Then
        assertEquals(new BigDecimal("100.00"), discount);
    }

    @Test
    @DisplayName("PercentageDiscountStrategy should round correctly")
    void percentageDiscountStrategy_Rounding() {
        // Given
        DiscountStrategy strategy = new PercentageDiscountStrategy();
        testOrder.setSubtotal(new BigDecimal("99.99"));

        // When
        BigDecimal discount = strategy.calculateDiscount(testOrder);

        // Then
        assertEquals(new BigDecimal("10.00"), discount);
    }

    @Test
    @DisplayName("FixedAmountDiscountStrategy should return fixed discount")
    void fixedAmountDiscountStrategy_CalculateDiscount() {
        // Given
        DiscountStrategy strategy = new FixedAmountDiscountStrategy();

        // When
        BigDecimal discount = strategy.calculateDiscount(testOrder);

        // Then
        assertEquals(new BigDecimal("50.00"), discount);
        assertEquals("FIXED", strategy.getType());
    }

    @Test
    @DisplayName("FixedAmountDiscountStrategy should return same amount regardless of order total")
    void fixedAmountDiscountStrategy_SameAmount() {
        // Given
        DiscountStrategy strategy = new FixedAmountDiscountStrategy();
        testOrder.setSubtotal(new BigDecimal("1000.00"));

        // When
        BigDecimal discount = strategy.calculateDiscount(testOrder);

        // Then
        assertEquals(new BigDecimal("50.00"), discount);
    }

    @Test
    @DisplayName("VolumeDiscountStrategy should return zero for less than 3 items")
    void volumeDiscountStrategy_LessThan3Items() {
        // Given
        DiscountStrategy strategy = new VolumeDiscountStrategy();
        OrderItem item1 = OrderItem.builder().product(testProduct).quantity(1).build();
        OrderItem item2 = OrderItem.builder().product(testProduct).quantity(1).build();
        testOrder.setItems(new ArrayList<>(Arrays.asList(item1, item2)));
        testOrder.setSubtotal(new BigDecimal("200.00"));

        // When
        BigDecimal discount = strategy.calculateDiscount(testOrder);

        // Then
        assertEquals(BigDecimal.ZERO, discount);
        assertEquals("VOLUME", strategy.getType());
    }

    @Test
    @DisplayName("VolumeDiscountStrategy should apply 5% for 3-4 items")
    void volumeDiscountStrategy_3To4Items() {
        // Given
        DiscountStrategy strategy = new VolumeDiscountStrategy();
        OrderItem item = OrderItem.builder().product(testProduct).quantity(3).build();
        testOrder.setItems(new ArrayList<>(Arrays.asList(item)));
        testOrder.setSubtotal(new BigDecimal("300.00"));

        // When
        BigDecimal discount = strategy.calculateDiscount(testOrder);

        // Then
        assertEquals(new BigDecimal("15.00"), discount.setScale(2, RoundingMode.HALF_UP));
    }

    @Test
    @DisplayName("VolumeDiscountStrategy should apply 8% for 5-9 items")
    void volumeDiscountStrategy_5To9Items() {
        // Given
        DiscountStrategy strategy = new VolumeDiscountStrategy();
        OrderItem item = OrderItem.builder().product(testProduct).quantity(5).build();
        testOrder.setItems(new ArrayList<>(Arrays.asList(item)));
        testOrder.setSubtotal(new BigDecimal("500.00"));

        // When
        BigDecimal discount = strategy.calculateDiscount(testOrder);

        // Then
        assertEquals(new BigDecimal("40.00"), discount.setScale(2, RoundingMode.HALF_UP));
    }

    @Test
    @DisplayName("VolumeDiscountStrategy should apply 15% for 10 or more items")
    void volumeDiscountStrategy_10OrMoreItems() {
        // Given
        DiscountStrategy strategy = new VolumeDiscountStrategy();
        OrderItem item = OrderItem.builder().product(testProduct).quantity(10).build();
        testOrder.setItems(new ArrayList<>(Arrays.asList(item)));
        testOrder.setSubtotal(new BigDecimal("1000.00"));

        // When
        BigDecimal discount = strategy.calculateDiscount(testOrder);

        // Then
        assertEquals(new BigDecimal("150.00"), discount.setScale(2, RoundingMode.HALF_UP));
    }

    @Test
    @DisplayName("VolumeDiscountStrategy should sum quantities across multiple items")
    void volumeDiscountStrategy_MultipleItems() {
        // Given
        DiscountStrategy strategy = new VolumeDiscountStrategy();
        OrderItem item1 = OrderItem.builder().product(testProduct).quantity(3).build();
        OrderItem item2 = OrderItem.builder().product(testProduct).quantity(4).build();
        OrderItem item3 = OrderItem.builder().product(testProduct).quantity(3).build();
        testOrder.setItems(new ArrayList<>(Arrays.asList(item1, item2, item3)));
        testOrder.setSubtotal(new BigDecimal("1000.00"));

        // When
        BigDecimal discount = strategy.calculateDiscount(testOrder);

        // Then - 10 items total, should get 15% discount
        assertEquals(new BigDecimal("150.00"), discount.setScale(2, RoundingMode.HALF_UP));
    }

    @Test
    @DisplayName("LoyaltyDiscountStrategy should return zero for less than 500 points")
    void loyaltyDiscountStrategy_LessThan500Points() {
        // Given
        DiscountStrategy strategy = new LoyaltyDiscountStrategy();
        testUser.setLoyaltyPoints(100);

        // When
        BigDecimal discount = strategy.calculateDiscount(testOrder);

        // Then
        assertEquals(BigDecimal.ZERO, discount);
        assertEquals("LOYALTY", strategy.getType());
    }

    @Test
    @DisplayName("LoyaltyDiscountStrategy should apply 3% for 500-999 points")
    void loyaltyDiscountStrategy_500To999Points() {
        // Given
        DiscountStrategy strategy = new LoyaltyDiscountStrategy();
        testUser.setLoyaltyPoints(500);
        testOrder.setSubtotal(new BigDecimal("1000.00"));

        // When
        BigDecimal discount = strategy.calculateDiscount(testOrder);

        // Then
        assertEquals(new BigDecimal("30.00"), discount.setScale(2, RoundingMode.HALF_UP));
    }

    @Test
    @DisplayName("LoyaltyDiscountStrategy should apply 5% for 1000 or more points")
    void loyaltyDiscountStrategy_1000OrMorePoints() {
        // Given
        DiscountStrategy strategy = new LoyaltyDiscountStrategy();
        testUser.setLoyaltyPoints(1000);
        testOrder.setSubtotal(new BigDecimal("1000.00"));

        // When
        BigDecimal discount = strategy.calculateDiscount(testOrder);

        // Then
        assertEquals(new BigDecimal("50.00"), discount.setScale(2, RoundingMode.HALF_UP));
    }

    @Test
    @DisplayName("LoyaltyDiscountStrategy should apply 5% for more than 1000 points")
    void loyaltyDiscountStrategy_MoreThan1000Points() {
        // Given
        DiscountStrategy strategy = new LoyaltyDiscountStrategy();
        testUser.setLoyaltyPoints(2000);
        testOrder.setSubtotal(new BigDecimal("1000.00"));

        // When
        BigDecimal discount = strategy.calculateDiscount(testOrder);

        // Then
        assertEquals(new BigDecimal("50.00"), discount.setScale(2, RoundingMode.HALF_UP));
    }

    @Test
    @DisplayName("LoyaltyDiscountStrategy should handle zero loyalty points")
    void loyaltyDiscountStrategy_ZeroPoints() {
        // Given
        DiscountStrategy strategy = new LoyaltyDiscountStrategy();
        testUser.setLoyaltyPoints(0);

        // When
        BigDecimal discount = strategy.calculateDiscount(testOrder);

        // Then
        assertEquals(BigDecimal.ZERO, discount);
    }

    @Test
    @DisplayName("All strategies should handle zero subtotal")
    void allStrategies_ZeroSubtotal() {
        // Given
        DiscountStrategy percentageStrategy = new PercentageDiscountStrategy();
        DiscountStrategy fixedStrategy = new FixedAmountDiscountStrategy();
        DiscountStrategy volumeStrategy = new VolumeDiscountStrategy();
        DiscountStrategy loyaltyStrategy = new LoyaltyDiscountStrategy();

        testOrder.setSubtotal(BigDecimal.ZERO);

        // When & Then
        assertEquals(0, percentageStrategy.calculateDiscount(testOrder).compareTo(BigDecimal.ZERO));
        assertEquals(new BigDecimal("50.00"), fixedStrategy.calculateDiscount(testOrder));
        assertEquals(0, volumeStrategy.calculateDiscount(testOrder).compareTo(BigDecimal.ZERO));
        assertEquals(0, loyaltyStrategy.calculateDiscount(testOrder).compareTo(BigDecimal.ZERO));
    }
}
