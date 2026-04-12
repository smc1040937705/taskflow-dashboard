package com.example.ecommerce.dto;

import com.example.ecommerce.entity.OrderItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {

    private Long id;
    private Long productId;
    private String productName;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal discountAmount;

    public static OrderItemDTO fromEntity(OrderItem item) {
        return OrderItemDTO.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProductNameSnapshot() != null ? item.getProductNameSnapshot() : item.getProduct().getName())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .discountAmount(item.getDiscountAmount())
                .build();
    }

    public BigDecimal getSubtotal() {
        return price.multiply(BigDecimal.valueOf(quantity))
                .subtract(discountAmount != null ? discountAmount : BigDecimal.ZERO);
    }
}
