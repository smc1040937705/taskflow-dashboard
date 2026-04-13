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
import org.mockito.MockedConstruction;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
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
    private Product testProduct1;
    private Product testProduct2;
    private Order testOrder;
    private OrderItem testOrderItem;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .balance(BigDecimal.valueOf(1000))
                .loyaltyPoints(100)
                .build();

        testProduct1 = Product.builder()
                .id(1L)
                .name("Product 1")
                .price(BigDecimal.valueOf(100))
                .stock(10)
                .active(true)
                .build();

        testProduct2 = Product.builder()
                .id(2L)
                .name("Product 2")
                .price(BigDecimal.valueOf(200))
                .stock(5)
                .active(true)
                .build();

        testOrderItem = OrderItem.builder()
                .id(1L)
                .product(testProduct1)
                .quantity(2)
                .price(BigDecimal.valueOf(100))
                .build();

        testOrder = Order.builder()
                .id(1L)
                .user(testUser)
                .status(Order.OrderStatus.PENDING)
                .shippingAddress("Test Address")
                .items(new ArrayList<>())
                .build();
        testOrder.getItems().add(testOrderItem);
    }

    @Test
    @DisplayName("Should create order successfully")
    void createOrder_Success() {
        OrderItem item = OrderItem.builder()
                .product(Product.builder().id(1L).build())
                .quantity(2)
                .build();

        try (MockedConstruction<Order> mocked = mockConstruction(Order.class, (mock, context) -> {
            when(mock.getUser()).thenReturn(testUser);
            when(mock.getStatus()).thenReturn(Order.OrderStatus.PENDING);
            when(mock.getItems()).thenReturn(new ArrayList<>());
        })) {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct1));
            when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

            Order result = orderService.createOrder(1L, Arrays.asList(item), "Test Address");

            assertNotNull(result);
            verify(productRepository).save(any(Product.class));
            verify(orderRepository).save(any(Order.class));
        }
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void createOrder_UserNotFound() {
        OrderItem item = OrderItem.builder()
                .product(Product.builder().id(1L).build())
                .quantity(2)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.createOrder(1L, Arrays.asList(item), "Test Address");
        });

        assertEquals("User not found", exception.getMessage());
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when product not found")
    void createOrder_ProductNotFound() {
        OrderItem item = OrderItem.builder()
                .product(Product.builder().id(999L).build())
                .quantity(2)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.createOrder(1L, Arrays.asList(item), "Test Address");
        });

        assertEquals("Product not found", exception.getMessage());
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when insufficient stock")
    void createOrder_InsufficientStock() {
        OrderItem item = OrderItem.builder()
                .product(Product.builder().id(1L).build())
                .quantity(20)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct1));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.createOrder(1L, Arrays.asList(item), "Test Address");
        });

        assertTrue(exception.getMessage().contains("Insufficient stock"));
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should get order by id successfully")
    void getOrderById_Success() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        Order result = orderService.getOrderById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(testUser, result.getUser());
    }

    @Test
    @DisplayName("Should throw exception when order not found")
    void getOrderById_NotFound() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.getOrderById(999L);
        });

        assertEquals("Order not found", exception.getMessage());
    }

    @Test
    @DisplayName("Should get orders by user id")
    void getOrdersByUser_Success() {
        List<Order> orders = Arrays.asList(testOrder);
        when(orderRepository.findByUserId(1L)).thenReturn(orders);

        List<Order> result = orderService.getOrdersByUser(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testOrder, result.get(0));
    }

    @Test
    @DisplayName("Should get all orders")
    void getAllOrders_Success() {
        List<Order> orders = Arrays.asList(testOrder);
        when(orderRepository.findAll()).thenReturn(orders);

        List<Order> result = orderService.getAllOrders();

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Should update order status successfully")
    void updateOrderStatus_Success() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        Order result = orderService.updateOrderStatus(1L, Order.OrderStatus.PAID);

        assertNotNull(result);
        assertEquals(Order.OrderStatus.PAID, result.getStatus());
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent order")
    void updateOrderStatus_NotFound() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.updateOrderStatus(999L, Order.OrderStatus.PAID);
        });

        assertEquals("Order not found", exception.getMessage());
    }

    @Test
    @DisplayName("Should cancel order successfully")
    void cancelOrder_Success() {
        testOrder.setStatus(Order.OrderStatus.PENDING);
        testProduct1.setStock(8);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        orderService.cancelOrder(1L);

        assertEquals(Order.OrderStatus.CANCELLED, testOrder.getStatus());
        verify(productRepository).save(any(Product.class));
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    @DisplayName("Should throw exception when cancelling non-pending order")
    void cancelOrder_NotPending() {
        testOrder.setStatus(Order.OrderStatus.SHIPPED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.cancelOrder(1L);
        });

        assertEquals("Only pending orders can be cancelled", exception.getMessage());
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when cancelling non-existent order")
    void cancelOrder_NotFound() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.cancelOrder(999L);
        });

        assertEquals("Order not found", exception.getMessage());
    }

    @Test
    @DisplayName("Should calculate total revenue")
    void calculateTotalRevenue_Success() {
        BigDecimal expectedRevenue = BigDecimal.valueOf(1000);
        when(orderRepository.calculateTotalRevenue()).thenReturn(expectedRevenue);

        BigDecimal result = orderService.calculateTotalRevenue();

        assertEquals(expectedRevenue, result);
    }

    @Test
    @DisplayName("Should calculate average order value")
    void calculateAverageOrderValue_Success() {
        BigDecimal expectedAverage = BigDecimal.valueOf(500);
        when(orderRepository.calculateAverageOrderValue()).thenReturn(expectedAverage);

        BigDecimal result = orderService.calculateAverageOrderValue();

        assertEquals(expectedAverage, result);
    }

    @Test
    @DisplayName("Should apply discount to order")
    void applyDiscount_Success() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        Order result = orderService.applyDiscount(1L, BigDecimal.valueOf(50));

        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(50), result.getDiscountAmount());
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    @DisplayName("Should throw exception when applying discount to non-existent order")
    void applyDiscount_NotFound() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            orderService.applyDiscount(999L, BigDecimal.valueOf(50));
        });

        assertEquals("Order not found", exception.getMessage());
    }

    @Test
    @DisplayName("Should get order statistics")
    void getOrderStatistics_Success() {
        when(orderRepository.countByStatus(Order.OrderStatus.PENDING)).thenReturn(5L);
        when(orderRepository.countByStatus(Order.OrderStatus.PAID)).thenReturn(10L);
        when(orderRepository.countByStatus(Order.OrderStatus.SHIPPED)).thenReturn(3L);
        when(orderRepository.countByStatus(Order.OrderStatus.DELIVERED)).thenReturn(20L);
        when(orderRepository.countByStatus(Order.OrderStatus.CANCELLED)).thenReturn(2L);
        when(orderRepository.countByStatus(Order.OrderStatus.REFUNDED)).thenReturn(1L);

        Map<String, Long> result = orderService.getOrderStatistics();

        assertNotNull(result);
        assertEquals(6, result.size());
        assertEquals(5L, result.get("PENDING"));
        assertEquals(10L, result.get("PAID"));
    }
}
