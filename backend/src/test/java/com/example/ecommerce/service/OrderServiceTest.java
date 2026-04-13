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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Order Service Tests")
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
    private Order testOrder;
    private OrderItem testOrderItem;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .build();

        testProduct = Product.builder()
                .id(1L)
                .name("Test Product")
                .price(new BigDecimal("100.00"))
                .stock(10)
                .build();

        testOrderItem = OrderItem.builder()
                .id(1L)
                .product(testProduct)
                .quantity(2)
                .price(new BigDecimal("100.00"))
                .build();

        testOrder = Order.builder()
                .id(1L)
                .user(testUser)
                .status(Order.OrderStatus.PENDING)
                .shippingAddress("123 Test St")
                .items(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("Should create order successfully with valid data")
    void createOrder_Success() {
        // Given
        OrderItem item = OrderItem.builder()
                .id(1L)
                .product(testProduct)
                .quantity(2)
                .build();
        List<OrderItem> items = Arrays.asList(item);
        
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            order.setId(1L);
            return order;
        });

        // When
        Order result = orderService.createOrder(1L, items, "123 Test St");

        // Then
        assertNotNull(result);
        assertEquals(Order.OrderStatus.PENDING, result.getStatus());
        assertEquals("123 Test St", result.getShippingAddress());
        assertEquals(1, result.getItems().size());
        verify(productRepository).save(any(Product.class));
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void createOrder_UserNotFound() {
        // Given
        List<OrderItem> items = Arrays.asList(testOrderItem);
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> orderService.createOrder(1L, items, "123 Test St"));
        assertEquals("User not found", exception.getMessage());
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when product not found")
    void createOrder_ProductNotFound() {
        // Given
        List<OrderItem> items = Arrays.asList(testOrderItem);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> orderService.createOrder(1L, items, "123 Test St"));
        assertEquals("Product not found", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when insufficient stock")
    void createOrder_InsufficientStock() {
        // Given
        OrderItem itemWithHighQuantity = OrderItem.builder()
                .product(testProduct)
                .quantity(20)
                .build();
        List<OrderItem> items = Arrays.asList(itemWithHighQuantity);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> orderService.createOrder(1L, items, "123 Test St"));
        assertTrue(exception.getMessage().contains("Insufficient stock"));
    }

    @Test
    @DisplayName("Should reduce stock when creating order")
    void createOrder_ReduceStock() {
        // Given
        OrderItem item = OrderItem.builder()
                .id(1L)
                .product(testProduct)
                .quantity(2)
                .build();
        List<OrderItem> items = Arrays.asList(item);
        
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        orderService.createOrder(1L, items, "123 Test St");

        // Then
        assertEquals(8, testProduct.getStock()); // 10 - 2 = 8
        verify(productRepository).save(testProduct);
    }

    @Test
    @DisplayName("Should get order by ID successfully")
    void getOrderById_Success() {
        // Given
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        // When
        Order result = orderService.getOrderById(1L);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(testUser, result.getUser());
    }

    @Test
    @DisplayName("Should throw exception when order not found")
    void getOrderById_NotFound() {
        // Given
        when(orderRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> orderService.getOrderById(1L));
        assertEquals("Order not found", exception.getMessage());
    }

    @Test
    @DisplayName("Should get orders by user ID")
    void getOrdersByUser_Success() {
        // Given
        List<Order> orders = Arrays.asList(testOrder);
        when(orderRepository.findByUserId(1L)).thenReturn(orders);

        // When
        List<Order> result = orderService.getOrdersByUser(1L);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testOrder, result.get(0));
    }

    @Test
    @DisplayName("Should get all orders")
    void getAllOrders_Success() {
        // Given
        List<Order> orders = Arrays.asList(testOrder);
        when(orderRepository.findAll()).thenReturn(orders);

        // When
        List<Order> result = orderService.getAllOrders();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Should update order status successfully")
    void updateOrderStatus_Success() {
        // Given
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        Order result = orderService.updateOrderStatus(1L, Order.OrderStatus.PAID);

        // Then
        assertEquals(Order.OrderStatus.PAID, result.getStatus());
        verify(orderRepository).save(testOrder);
    }

    @Test
    @DisplayName("Should throw exception when updating status of non-existent order")
    void updateOrderStatus_OrderNotFound() {
        // Given
        when(orderRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> orderService.updateOrderStatus(1L, Order.OrderStatus.PAID));
        assertEquals("Order not found", exception.getMessage());
    }

    @Test
    @DisplayName("Should cancel pending order successfully")
    void cancelOrder_Success() {
        // Given
        OrderItem item = OrderItem.builder()
                .id(1L)
                .product(testProduct)
                .quantity(2)
                .build();
        Order order = Order.builder()
                .id(1L)
                .user(testUser)
                .status(Order.OrderStatus.PENDING)
                .items(new ArrayList<>(Arrays.asList(item)))
                .build();
        item.setOrder(order);
        
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        orderService.cancelOrder(1L);

        // Then
        assertEquals(Order.OrderStatus.CANCELLED, order.getStatus());
        assertEquals(12, testProduct.getStock()); // 10 + 2 = 12
        verify(productRepository).save(testProduct);
        verify(orderRepository).save(order);
    }

    @Test
    @DisplayName("Should throw exception when cancelling non-pending order")
    void cancelOrder_NotPending() {
        // Given
        testOrder.setStatus(Order.OrderStatus.SHIPPED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> orderService.cancelOrder(1L));
        assertEquals("Only pending orders can be cancelled", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when cancelling non-existent order")
    void cancelOrder_NotFound() {
        // Given
        when(orderRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> orderService.cancelOrder(1L));
        assertEquals("Order not found", exception.getMessage());
    }

    @Test
    @DisplayName("Should restore stock when cancelling order")
    void cancelOrder_RestoreStock() {
        // Given
        OrderItem item = OrderItem.builder()
                .id(1L)
                .product(testProduct)
                .quantity(2)
                .build();
        Order order = Order.builder()
                .id(1L)
                .user(testUser)
                .status(Order.OrderStatus.PENDING)
                .items(new ArrayList<>(Arrays.asList(item)))
                .build();
        item.setOrder(order);
        
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        orderService.cancelOrder(1L);

        // Then
        verify(productRepository).save(argThat(product -> product.getStock() == 12));
    }

    @Test
    @DisplayName("Should calculate total revenue")
    void calculateTotalRevenue_Success() {
        // Given
        BigDecimal expectedRevenue = new BigDecimal("1000.00");
        when(orderRepository.calculateTotalRevenue()).thenReturn(expectedRevenue);

        // When
        BigDecimal result = orderService.calculateTotalRevenue();

        // Then
        assertEquals(expectedRevenue, result);
    }

    @Test
    @DisplayName("Should calculate average order value")
    void calculateAverageOrderValue_Success() {
        // Given
        BigDecimal expectedAverage = new BigDecimal("150.00");
        when(orderRepository.calculateAverageOrderValue()).thenReturn(expectedAverage);

        // When
        BigDecimal result = orderService.calculateAverageOrderValue();

        // Then
        assertEquals(expectedAverage, result);
    }

    @Test
    @DisplayName("Should apply discount to order")
    void applyDiscount_Success() {
        // Given
        BigDecimal discountAmount = new BigDecimal("10.00");
        when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        Order result = orderService.applyDiscount(1L, discountAmount);

        // Then
        assertEquals(discountAmount, result.getDiscountAmount());
        verify(orderRepository).save(testOrder);
    }

    @Test
    @DisplayName("Should throw exception when applying discount to non-existent order")
    void applyDiscount_OrderNotFound() {
        // Given
        when(orderRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> orderService.applyDiscount(1L, new BigDecimal("10.00")));
        assertEquals("Order not found", exception.getMessage());
    }

    @Test
    @DisplayName("Should get order statistics")
    void getOrderStatistics_Success() {
        // Given
        when(orderRepository.countByStatus(Order.OrderStatus.PENDING)).thenReturn(5L);
        when(orderRepository.countByStatus(Order.OrderStatus.PAID)).thenReturn(10L);
        when(orderRepository.countByStatus(Order.OrderStatus.SHIPPED)).thenReturn(3L);
        when(orderRepository.countByStatus(Order.OrderStatus.DELIVERED)).thenReturn(20L);
        when(orderRepository.countByStatus(Order.OrderStatus.CANCELLED)).thenReturn(2L);
        when(orderRepository.countByStatus(Order.OrderStatus.REFUNDED)).thenReturn(1L);

        // When
        Map<String, Long> result = orderService.getOrderStatistics();

        // Then
        assertNotNull(result);
        assertEquals(5L, result.get("PENDING"));
        assertEquals(10L, result.get("PAID"));
        assertEquals(3L, result.get("SHIPPED"));
        assertEquals(20L, result.get("DELIVERED"));
        assertEquals(2L, result.get("CANCELLED"));
        assertEquals(1L, result.get("REFUNDED"));
    }
}
