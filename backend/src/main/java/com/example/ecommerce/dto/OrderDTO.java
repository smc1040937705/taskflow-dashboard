package com.example.ecommerce.dto;

import com.example.ecommerce.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {

    private Long id;
    private String orderNumber;
    private Long userId;
    private String username;
    private List<OrderItemDTO> items;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal shippingAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private Order.OrderStatus status;
    private Order.PaymentStatus paymentStatus;
    private Order.PaymentMethod paymentMethod;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    private String shippingAddress;
    private String billingAddress;
    private String trackingNumber;
    private String courier;
    private String notes;
    private String couponCode;
    private Integer loyaltyPointsUsed;
    private BigDecimal loyaltyDiscount;

    public static OrderDTO fromEntity(Order order) {
        return OrderDTO.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser().getId())
                .username(order.getUser().getUsername())
                .items(order.getItems().stream().map(OrderItemDTO::fromEntity).collect(Collectors.toList()))
                .subtotal(order.getSubtotal())
                .taxAmount(order.getTaxAmount())
                .shippingAmount(order.getShippingAmount())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .createdAt(order.getCreatedAt())
                .paidAt(order.getPaidAt())
                .shippedAt(order.getShippedAt())
                .deliveredAt(order.getDeliveredAt())
                .shippingAddress(order.getShippingAddress())
                .billingAddress(order.getBillingAddress())
                .trackingNumber(order.getTrackingNumber())
                .courier(order.getCourier())
                .notes(order.getNotes())
                .couponCode(order.getCouponCode())
                .loyaltyPointsUsed(order.getLoyaltyPointsUsed())
                .loyaltyDiscount(order.getLoyaltyDiscount())
                .build();
    }
}
