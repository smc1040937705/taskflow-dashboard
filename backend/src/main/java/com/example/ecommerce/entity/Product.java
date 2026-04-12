package com.example.ecommerce.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(length = 5000)
    private String description;
    
    @Column(nullable = false)
    private BigDecimal price;
    
    private BigDecimal discountPrice;
    
    private Integer stock;
    
    private String sku;
    
    private String imageUrl;
    
    @Enumerated(EnumType.STRING)
    private ProductStatus status;
    
    private Long categoryId;
    
    private Long brandId;
    
    private Float weight;
    
    private String dimensions;
    
    private Boolean featured;
    
    private Boolean newArrival;
    
    private Double averageRating;
    
    private String category;
    
    private Boolean active;
    
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<OrderItem> orderItems = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (active == null) active = true;
        if (stock == null) stock = 0;
        if (status == null) status = ProductStatus.ACTIVE;
        if (featured == null) featured = false;
        if (newArrival == null) newArrival = false;
        if (averageRating == null) averageRating = 0.0;
    }
    
    public enum ProductStatus {
        ACTIVE, INACTIVE, OUT_OF_STOCK, DISCONTINUED
    }
}
