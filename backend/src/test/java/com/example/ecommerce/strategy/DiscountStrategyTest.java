package com.example.ecommerce.strategy;

import com.example.ecommerce.entity.Order;
import com.example.ecommerce.entity.OrderItem;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class DiscountStrategyTest {

    private Order testOrder;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .loyaltyPoints(100)
                .build();

        testOrder = Order.builder()
                .id(1L)
                .user(testUser)
                .subtotal(BigDecimal.valueOf(1000))
                .items(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("PercentageDiscountStrategy should calculate 10% discount")
    void percentageDiscountStrategy_CalculateDiscount() {
        PercentageDiscountStrategy strategy = new PercentageDiscountStrategy();
        
        BigDecimal discount = strategy.calculateDiscount(testOrder);
        
        assertEquals(new BigDecimal("100.00"), discount);
        assertEquals("PERCENTAGE", strategy.getType());
    }

    @Test
    @DisplayName("PercentageDiscountStrategy should handle zero subtotal")
    void percentageDiscountStrategy_ZeroSubtotal() {
        testOrder.setSubtotal(BigDecimal.ZERO);
        PercentageDiscountStrategy strategy = new PercentageDiscountStrategy();
        
        BigDecimal discount = strategy.calculateDiscount(testOrder);
        
        assertEquals(BigDecimal.ZERO.setScale(2), discount);
    }

    @Test
    @DisplayName("FixedAmountDiscountStrategy should return fixed discount")
    void fixedAmountDiscountStrategy_CalculateDiscount() {
        FixedAmountDiscountStrategy strategy = new FixedAmountDiscountStrategy();
        
        BigDecimal discount = strategy.calculateDiscount(testOrder);
        
        assertEquals(new BigDecimal("50.00"), discount);
        assertEquals("FIXED", strategy.getType());
    }

    @Test
    @DisplayName("VolumeDiscountStrategy should calculate 15% discount for 10+ items")
    void volumeDiscountStrategy_TenOrMoreItems() {
        addOrderItems(testOrder, 10);
        VolumeDiscountStrategy strategy = new VolumeDiscountStrategy();
        
        BigDecimal discount = strategy.calculateDiscount(testOrder);
        
        assertEquals(new BigDecimal("150.00"), discount);
        assertEquals("VOLUME", strategy.getType());
    }

    @Test
    @DisplayName("VolumeDiscountStrategy should calculate 8% discount for 5-9 items")
    void volumeDiscountStrategy_FiveToNineItems() {
        addOrderItems(testOrder, 7);
        VolumeDiscountStrategy strategy = new VolumeDiscountStrategy();
        
        BigDecimal discount = strategy.calculateDiscount(testOrder);
        
        assertEquals(new BigDecimal("80.00"), discount);
    }

    @Test
    @DisplayName("VolumeDiscountStrategy should calculate 5% discount for 3-4 items")
    void volumeDiscountStrategy_ThreeToFourItems() {
        addOrderItems(testOrder, 3);
        VolumeDiscountStrategy strategy = new VolumeDiscountStrategy();
        
        BigDecimal discount = strategy.calculateDiscount(testOrder);
        
        assertEquals(new BigDecimal("50.00"), discount);
    }

    @Test
    @DisplayName("VolumeDiscountStrategy should return zero for less than 3 items")
    void volumeDiscountStrategy_LessThanThreeItems() {
        addOrderItems(testOrder, 2);
        VolumeDiscountStrategy strategy = new VolumeDiscountStrategy();
        
        BigDecimal discount = strategy.calculateDiscount(testOrder);
        
        assertEquals(BigDecimal.ZERO, discount);
    }

    @Test
    @DisplayName("LoyaltyDiscountStrategy should calculate 5% discount for 1000+ points")
    void loyaltyDiscountStrategy_ThousandOrMorePoints() {
        testUser.setLoyaltyPoints(1000);
        LoyaltyDiscountStrategy strategy = new LoyaltyDiscountStrategy();
        
        BigDecimal discount = strategy.calculateDiscount(testOrder);
        
        assertEquals(new BigDecimal("50.00"), discount);
        assertEquals("LOYALTY", strategy.getType());
    }

    @Test
    @DisplayName("LoyaltyDiscountStrategy should calculate 3% discount for 500-999 points")
    void loyaltyDiscountStrategy_FiveHundredToNineHundredNinetyNinePoints() {
        testUser.setLoyaltyPoints(500);
        LoyaltyDiscountStrategy strategy = new LoyaltyDiscountStrategy();
        
        BigDecimal discount = strategy.calculateDiscount(testOrder);
        
        assertEquals(new BigDecimal("30.00"), discount);
    }

    @Test
    @DisplayName("LoyaltyDiscountStrategy should return zero for less than 500 points")
    void loyaltyDiscountStrategy_LessThanFiveHundredPoints() {
        testUser.setLoyaltyPoints(100);
        LoyaltyDiscountStrategy strategy = new LoyaltyDiscountStrategy();
        
        BigDecimal discount = strategy.calculateDiscount(testOrder);
        
        assertEquals(BigDecimal.ZERO, discount);
    }

    @Test
    @DisplayName("DiscountStrategyFactory should return correct strategy")
    void discountStrategyFactory_GetStrategy() {
        Map<String, DiscountStrategy> strategies = new HashMap<>();
        strategies.put("PERCENTAGE", new PercentageDiscountStrategy());
        strategies.put("FIXED", new FixedAmountDiscountStrategy());
        strategies.put("VOLUME", new VolumeDiscountStrategy());
        strategies.put("LOYALTY", new LoyaltyDiscountStrategy());
        
        DiscountStrategyFactory factory = new DiscountStrategyFactory(strategies);
        
        DiscountStrategy strategy = factory.getStrategy("PERCENTAGE");
        
        assertNotNull(strategy);
        assertEquals("PERCENTAGE", strategy.getType());
    }

    @Test
    @DisplayName("DiscountStrategyFactory should throw exception for unknown strategy")
    void discountStrategyFactory_UnknownStrategy() {
        Map<String, DiscountStrategy> strategies = new HashMap<>();
        DiscountStrategyFactory factory = new DiscountStrategyFactory(strategies);
        
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            factory.getStrategy("UNKNOWN");
        });
        
        assertTrue(exception.getMessage().contains("Unknown discount strategy"));
    }

    @Test
    @DisplayName("DiscountStrategyFactory should apply best discount")
    void discountStrategyFactory_ApplyBestDiscount() {
        Map<String, DiscountStrategy> strategies = new HashMap<>();
        strategies.put("PERCENTAGE", new PercentageDiscountStrategy());
        strategies.put("FIXED", new FixedAmountDiscountStrategy());
        strategies.put("VOLUME", new VolumeDiscountStrategy());
        strategies.put("LOYALTY", new LoyaltyDiscountStrategy());
        
        DiscountStrategyFactory factory = new DiscountStrategyFactory(strategies);
        
        addOrderItems(testOrder, 10);
        testUser.setLoyaltyPoints(1000);
        
        BigDecimal bestDiscount = factory.applyBestDiscount(testOrder);
        
        assertNotNull(bestDiscount);
        assertTrue(bestDiscount.compareTo(BigDecimal.ZERO) >= 0);
    }

    @Test
    @DisplayName("DiscountStrategyFactory should return zero when no strategies available")
    void discountStrategyFactory_NoStrategies() {
        Map<String, DiscountStrategy> strategies = new HashMap<>();
        DiscountStrategyFactory factory = new DiscountStrategyFactory(strategies);
        
        BigDecimal bestDiscount = factory.applyBestDiscount(testOrder);
        
        assertEquals(BigDecimal.ZERO, bestDiscount);
    }

    private void addOrderItems(Order order, int totalQuantity) {
        order.getItems().clear();
        Product product = Product.builder()
                .id(1L)
                .price(BigDecimal.valueOf(100))
                .build();
        
        OrderItem item = OrderItem.builder()
                .product(product)
                .quantity(totalQuantity)
                .price(BigDecimal.valueOf(100))
                .build();
        item.setOrder(order);
        order.getItems().add(item);
    }
}
