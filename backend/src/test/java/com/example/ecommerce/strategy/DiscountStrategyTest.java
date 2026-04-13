package com.example.ecommerce.strategy;

import com.example.ecommerce.entity.Order;
import com.example.ecommerce.entity.OrderItem;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DiscountStrategyTest {

    @Mock
    private Order mockOrder;

    @Mock
    private OrderItem mockItem;

    @Mock
    private Product mockProduct;

    @Mock
    private User mockUser;

    private PercentageDiscountStrategy percentageDiscountStrategy;
    private FixedAmountDiscountStrategy fixedAmountDiscountStrategy;
    private VolumeDiscountStrategy volumeDiscountStrategy;
    private LoyaltyDiscountStrategy loyaltyDiscountStrategy;
    private DiscountStrategyFactory discountStrategyFactory;

    @BeforeEach
    void setUp() {
        percentageDiscountStrategy = new PercentageDiscountStrategy();
        fixedAmountDiscountStrategy = new FixedAmountDiscountStrategy();
        volumeDiscountStrategy = new VolumeDiscountStrategy();
        loyaltyDiscountStrategy = new LoyaltyDiscountStrategy();

        Map<String, DiscountStrategy> strategies = new HashMap<>();
        strategies.put("PERCENTAGE", percentageDiscountStrategy);
        strategies.put("FIXED", fixedAmountDiscountStrategy);
        strategies.put("VOLUME", volumeDiscountStrategy);
        strategies.put("LOYALTY", loyaltyDiscountStrategy);
        discountStrategyFactory = new DiscountStrategyFactory(strategies);
    }

    @Test
    @DisplayName("百分比折扣策略 - 计算10%折扣")
    void percentageDiscountStrategy_CalculateDiscount() {
        when(mockOrder.getSubtotal()).thenReturn(BigDecimal.valueOf(100));

        BigDecimal discount = percentageDiscountStrategy.calculateDiscount(mockOrder);

        assertEquals(BigDecimal.valueOf(10).setScale(2), discount);
    }

    @Test
    @DisplayName("百分比折扣策略 - 返回类型")
    void percentageDiscountStrategy_GetType() {
        assertEquals("PERCENTAGE", percentageDiscountStrategy.getType());
    }

    @Test
    @DisplayName("固定金额折扣策略 - 固定50元折扣")
    void fixedAmountDiscountStrategy_CalculateDiscount() {
        BigDecimal discount = fixedAmountDiscountStrategy.calculateDiscount(mockOrder);

        assertEquals(BigDecimal.valueOf(50).setScale(2), discount);
    }

    @Test
    @DisplayName("固定金额折扣策略 - 返回类型")
    void fixedAmountDiscountStrategy_GetType() {
        assertEquals("FIXED", fixedAmountDiscountStrategy.getType());
    }

    @Test
    @DisplayName("批量折扣策略 - 10件以上15%折扣")
    void volumeDiscountStrategy_Discount15Percent() {
        Order order = createOrderWithItemQuantity(10);
        
        BigDecimal discount = volumeDiscountStrategy.calculateDiscount(order);

        assertEquals(BigDecimal.valueOf(15).setScale(2), discount);
    }

    @Test
    @DisplayName("批量折扣策略 - 5-9件8%折扣")
    void volumeDiscountStrategy_Discount8Percent() {
        Order order = createOrderWithItemQuantity(5);
        
        BigDecimal discount = volumeDiscountStrategy.calculateDiscount(order);

        assertEquals(BigDecimal.valueOf(8).setScale(2), discount);
    }

    @Test
    @DisplayName("批量折扣策略 - 3-4件5%折扣")
    void volumeDiscountStrategy_Discount5Percent() {
        Order order = createOrderWithItemQuantity(3);
        
        BigDecimal discount = volumeDiscountStrategy.calculateDiscount(order);

        assertEquals(BigDecimal.valueOf(5).setScale(2), discount);
    }

    @Test
    @DisplayName("批量折扣策略 - 少于3件无折扣")
    void volumeDiscountStrategy_NoDiscount() {
        Order order = createOrderWithItemQuantity(2);
        
        BigDecimal discount = volumeDiscountStrategy.calculateDiscount(order);

        assertEquals(BigDecimal.ZERO, discount);
    }

    @Test
    @DisplayName("批量折扣策略 - 返回类型")
    void volumeDiscountStrategy_GetType() {
        assertEquals("VOLUME", volumeDiscountStrategy.getType());
    }

    @Test
    @DisplayName("会员折扣策略 - 1000积分以上5%折扣")
    void loyaltyDiscountStrategy_Discount5Percent() {
        User user = User.builder().loyaltyPoints(1500).build();
        Order order = createOrderWithUser(user);
        
        BigDecimal discount = loyaltyDiscountStrategy.calculateDiscount(order);

        assertEquals(BigDecimal.valueOf(5).setScale(2), discount);
    }

    @Test
    @DisplayName("会员折扣策略 - 500-999积分3%折扣")
    void loyaltyDiscountStrategy_Discount3Percent() {
        User user = User.builder().loyaltyPoints(700).build();
        Order order = createOrderWithUser(user);
        
        BigDecimal discount = loyaltyDiscountStrategy.calculateDiscount(order);

        assertEquals(BigDecimal.valueOf(3).setScale(2), discount);
    }

    @Test
    @DisplayName("会员折扣策略 - 少于500积分无折扣")
    void loyaltyDiscountStrategy_NoDiscount() {
        User user = User.builder().loyaltyPoints(300).build();
        Order order = createOrderWithUser(user);
        
        BigDecimal discount = loyaltyDiscountStrategy.calculateDiscount(order);

        assertEquals(BigDecimal.ZERO, discount);
    }

    @Test
    @DisplayName("会员折扣策略 - 返回类型")
    void loyaltyDiscountStrategy_GetType() {
        assertEquals("LOYALTY", loyaltyDiscountStrategy.getType());
    }

    @Test
    @DisplayName("折扣策略工厂 - 获取策略")
    void discountStrategyFactory_GetStrategy() {
        DiscountStrategy strategy = discountStrategyFactory.getStrategy("PERCENTAGE");

        assertNotNull(strategy);
        assertEquals("PERCENTAGE", strategy.getType());
    }

    @Test
    @DisplayName("折扣策略工厂 - 获取未知策略抛出异常")
    void discountStrategyFactory_GetUnknownStrategy() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            discountStrategyFactory.getStrategy("UNKNOWN");
        });

        assertEquals("Unknown discount strategy: UNKNOWN", exception.getMessage());
    }

    @Test
    @DisplayName("折扣策略工厂 - 应用最优折扣")
    void discountStrategyFactory_ApplyBestDiscount() {
        User user = User.builder().loyaltyPoints(1500).build();
        Order order = createOrderWithUser(user);
        order.setSubtotal(BigDecimal.valueOf(100));
        
        // 添加商品项用于批量折扣计算
        OrderItem item = OrderItem.builder()
                .product(mockProduct)
                .quantity(10)
                .build();
        order.addItem(item);

        BigDecimal discount = discountStrategyFactory.applyBestDiscount(order);

        // 批量折扣15% = 15元，会员折扣5% = 5元，百分比折扣10% = 10元，固定折扣50元
        // 最大的应该是固定折扣50元
        assertEquals(BigDecimal.valueOf(50).setScale(2), discount);
    }

    private Order createOrderWithItemQuantity(int quantity) {
        Order order = Order.builder()
                .subtotal(BigDecimal.valueOf(100))
                .build();
        
        for (int i = 0; i < quantity; i++) {
            OrderItem item = OrderItem.builder()
                    .product(mockProduct)
                    .quantity(1)
                    .build();
            order.addItem(item);
        }
        
        return order;
    }

    private Order createOrderWithUser(User user) {
        return Order.builder()
                .user(user)
                .subtotal(BigDecimal.valueOf(100))
                .build();
    }
}