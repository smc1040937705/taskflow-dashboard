package com.example.ecommerce.dto;

import com.example.ecommerce.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {

    private Long id;

    @NotBlank(message = "Product name is required")
    @Size(min = 2, max = 200)
    private String name;

    @Size(max = 5000)
    private String description;

    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;

    private BigDecimal discountPrice;

    @Min(0)
    private Integer stock;

    private String sku;

    private String imageUrl;

    private Product.ProductStatus status;

    private Long categoryId;

    private Long brandId;

    private Float weight;

    private String dimensions;

    private LocalDateTime createdAt;

    private Boolean featured;

    private Boolean newArrival;

    private Double averageRating;

    private String category;

    public static ProductDTO fromEntity(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .discountPrice(product.getDiscountPrice())
                .stock(product.getStock())
                .sku(product.getSku())
                .imageUrl(product.getImageUrl())
                .status(product.getStatus())
                .categoryId(product.getCategoryId())
                .brandId(product.getBrandId())
                .weight(product.getWeight())
                .dimensions(product.getDimensions())
                .createdAt(product.getCreatedAt())
                .featured(product.getFeatured())
                .newArrival(product.getNewArrival())
                .averageRating(product.getAverageRating())
                .category(product.getCategory())
                .build();
    }

    public BigDecimal getEffectivePrice() {
        return discountPrice != null && discountPrice.compareTo(BigDecimal.ZERO) > 0
                ? discountPrice
                : price;
    }

    public boolean isInStock() {
        return stock != null && stock > 0;
    }

    public boolean hasDiscount() {
        return discountPrice != null && discountPrice.compareTo(price) < 0;
    }
}
