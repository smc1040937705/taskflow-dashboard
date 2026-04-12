package com.example.ecommerce.strategy;

import com.example.ecommerce.entity.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

public interface DiscountStrategy {
    BigDecimal calculateDiscount(Order order);
    String getType();
}

@Component
class PercentageDiscountStrategy implements DiscountStrategy {
    @Override
    public BigDecimal calculateDiscount(Order order) {
        BigDecimal percentage = new BigDecimal("0.10");
        return order.getSubtotal().multiply(percentage).setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public String getType() {
        return "PERCENTAGE";
    }
}

@Component
class FixedAmountDiscountStrategy implements DiscountStrategy {
    @Override
    public BigDecimal calculateDiscount(Order order) {
        return new BigDecimal("50.00");
    }

    @Override
    public String getType() {
        return "FIXED";
    }
}

@Component
class VolumeDiscountStrategy implements DiscountStrategy {
    @Override
    public BigDecimal calculateDiscount(Order order) {
        int itemCount = order.getItems().stream().mapToInt(item -> item.getQuantity()).sum();
        if (itemCount >= 10) {
            return order.getSubtotal().multiply(new BigDecimal("0.15"));
        } else if (itemCount >= 5) {
            return order.getSubtotal().multiply(new BigDecimal("0.08"));
        } else if (itemCount >= 3) {
            return order.getSubtotal().multiply(new BigDecimal("0.05"));
        }
        return BigDecimal.ZERO;
    }

    @Override
    public String getType() {
        return "VOLUME";
    }
}

@Component
class LoyaltyDiscountStrategy implements DiscountStrategy {
    @Override
    public BigDecimal calculateDiscount(Order order) {
        if (order.getUser().getLoyaltyPoints() >= 1000) {
            return order.getSubtotal().multiply(new BigDecimal("0.05"));
        } else if (order.getUser().getLoyaltyPoints() >= 500) {
            return order.getSubtotal().multiply(new BigDecimal("0.03"));
        }
        return BigDecimal.ZERO;
    }

    @Override
    public String getType() {
        return "LOYALTY";
    }
}


