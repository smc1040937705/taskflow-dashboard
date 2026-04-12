package com.example.ecommerce.strategy;

import com.example.ecommerce.entity.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class DiscountStrategyFactory {
    private final Map<String, DiscountStrategy> strategies;

    public DiscountStrategy getStrategy(String type) {
        DiscountStrategy strategy = strategies.get(type);
        if (strategy == null) {
            throw new IllegalArgumentException("Unknown discount strategy: " + type);
        }
        return strategy;
    }

    public BigDecimal applyBestDiscount(Order order) {
        return strategies.values().stream()
                .map(strategy -> strategy.calculateDiscount(order))
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
    }
}
