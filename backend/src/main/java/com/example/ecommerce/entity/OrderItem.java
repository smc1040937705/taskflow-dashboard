package com.example.ecommerce.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;
    
    private String productNameSnapshot;
    
    private Integer quantity;
    
    private BigDecimal price;
    
    private BigDecimal discountAmount;
    
    private BigDecimal subtotal;
    
    @PrePersist
    @PreUpdate
    public void calculateSubtotal() {
        if (price != null && quantity != null) {
            BigDecimal itemDiscount = discountAmount != null ? discountAmount : BigDecimal.ZERO;
            this.subtotal = price.multiply(BigDecimal.valueOf(quantity)).subtract(itemDiscount);
        }
    }
}
