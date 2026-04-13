package com.example.ecommerce.service;

import com.example.ecommerce.entity.Order;
import com.example.ecommerce.entity.OrderItem;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.repository.OrderRepository;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.UserRepository;
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
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private OrderService orderService;

    private User testUser;
    private Product testProduct;
    private OrderItem testOrderItem;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .balance(BigDecimal.valueOf(1000))
                .loyaltyPoints(500)
                .build();

        testProduct = Product.builder()
                .id(1L)
                .name("Test Product")
                .price(BigDecimal.valueOf(100))
                .stock(10)
                .build();

        testOrderItem = OrderItem.builder()
                .product(testProduct)
                .quantity(2)
                .price(BigDecimal.valueOf(100))
                .build();
    }

    @Test
    @DisplayName("创建订单 - 成功")
    void createOrder_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        
        Order savedOrder = Order.builder()
                .id(1L)
                .user(testUser)
                .status(Order.OrderStatus.PENDING)
                .build();
        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);

        Order result = orderService.createOrder(1L, Arrays.asList(testOrderItem), "123 Test Street");

        assertNotNull(result);
        assertEquals(Order.OrderStatus.PENDING, result.getStatus());
        verify(productRepository, times(1)).save(any(Product.class));
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    @DisplayName("创建订单 - 用户不存在")
    void createOrder_UserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.createOrder(1L, Arrays.asList(testOrderItem), "123 Test Street");
        });

        assertEquals("User not found", exception.getMessage());
    }

    @Test
    @DisplayName("创建订单 - 商品不存在")
    void createOrder_ProductNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.createOrder(1L, Arrays.asList(testOrderItem), "123 Test Street");
        });

        assertEquals("Product not found", exception.getMessage());
    }

    @Test
    @DisplayName("创建订单 - 库存不足")
    void createOrder_InsufficientStock() {
        Product lowStockProduct = Product.builder()
                .id(1L)
                .name("Low Stock Product")
                .price(BigDecimal.valueOf(100))
                .stock(1)
                .build();
        
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(1L)).thenReturn(Optional.of(lowStockProduct));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.createOrder(1L, Arrays.asList(testOrderItem), "123 Test Street");
        });

        assertTrue(exception.getMessage().contains("Insufficient stock"));
    }

    @Test
    @DisplayName("获取订单 - 成功")
    void getOrderById_Success() {
        Order order = Order.builder()
                .id(1L)
                .user(testUser)
                .status(Order.OrderStatus.PENDING)
                .build();
        
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        Order result = orderService.getOrderById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    @DisplayName("获取订单 - 不存在")
    void getOrderById_NotFound() {
        when(orderRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.getOrderById(1L);
        });

        assertEquals("Order not found", exception.getMessage());
    }

    @Test
    @DisplayName("获取用户订单列表")
    void getOrdersByUser_Success() {
        Order order1 = Order.builder().id(1L).user(testUser).build();
        Order order2 = Order.builder().id(2L).user(testUser).build();
        
        when(orderRepository.findByUserId(1L)).thenReturn(Arrays.asList(order1, order2));

        List<Order> result = orderService.getOrdersByUser(1L);

        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("获取所有订单")
    void getAllOrders_Success() {
        when(orderRepository.findAll()).thenReturn(Arrays.asList(
                Order.builder().id(1L).build(),
                Order.builder().id(2L).build()
        ));

        List<Order> result = orderService.getAllOrders();

        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("更新订单状态 - 成功")
    void updateOrderStatus_Success() {
        Order order = Order.builder()
                .id(1L)
                .status(Order.OrderStatus.PENDING)
                .build();
        
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        Order result = orderService.updateOrderStatus(1L, Order.OrderStatus.PAID);

        assertEquals(Order.OrderStatus.PAID, result.getStatus());
    }

    @Test
    @DisplayName("取消订单 - 成功")
    void cancelOrder_Success() {
        Order order = Order.builder()
                .id(1L)
                .status(Order.OrderStatus.PENDING)
                .build();
        order.addItem(testOrderItem);
        
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertDoesNotThrow(() -> orderService.cancelOrder(1L));
        
        verify(productRepository, times(1)).save(any(Product.class));
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    @DisplayName("取消订单 - 订单不存在")
    void cancelOrder_NotFound() {
        when(orderRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.cancelOrder(1L);
        });

        assertEquals("Order not found", exception.getMessage());
    }

    @Test
    @DisplayName("取消订单 - 非待支付状态")
    void cancelOrder_NotPending() {
        Order order = Order.builder()
                .id(1L)
                .status(Order.OrderStatus.PAID)
                .build();
        
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.cancelOrder(1L);
        });

        assertEquals("Only pending orders can be cancelled", exception.getMessage());
    }

    @Test
    @DisplayName("应用折扣 - 成功")
    void applyDiscount_Success() {
        Order order = Order.builder()
                .id(1L)
                .subtotal(BigDecimal.valueOf(100))
                .discountAmount(BigDecimal.ZERO)
                .build();
        
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        Order result = orderService.applyDiscount(1L, BigDecimal.valueOf(10));

        assertEquals(BigDecimal.valueOf(10), result.getDiscountAmount());
    }

    @Test
    @DisplayName("计算总收入")
    void calculateTotalRevenue_Success() {
        when(orderRepository.calculateTotalRevenue()).thenReturn(BigDecimal.valueOf(10000));

        BigDecimal result = orderService.calculateTotalRevenue();

        assertEquals(BigDecimal.valueOf(10000), result);
    }

    @Test
    @DisplayName("计算平均订单价值")
    void calculateAverageOrderValue_Success() {
        when(orderRepository.calculateAverageOrderValue()).thenReturn(BigDecimal.valueOf(250));

        BigDecimal result = orderService.calculateAverageOrderValue();

        assertEquals(BigDecimal.valueOf(250), result);
    }
}