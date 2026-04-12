package com.example.ecommerce.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class BusinessException extends RuntimeException {

    private final String errorCode;
    private final HttpStatus status;

    public BusinessException(String message) {
        super(message);
        this.errorCode = "BUSINESS_ERROR";
        this.status = HttpStatus.BAD_REQUEST;
    }

    public BusinessException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.status = HttpStatus.BAD_REQUEST;
    }

    public BusinessException(String errorCode, String message, HttpStatus status) {
        super(message);
        this.errorCode = errorCode;
        this.status = status;
    }

    public static BusinessException userNotFound() {
        return new BusinessException("USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND);
    }

    public static BusinessException usernameAlreadyExists() {
        return new BusinessException("USERNAME_EXISTS", "Username already exists");
    }

    public static BusinessException emailAlreadyExists() {
        return new BusinessException("EMAIL_EXISTS", "Email already exists");
    }

    public static BusinessException invalidCredentials() {
        return new BusinessException("INVALID_CREDENTIALS", "Invalid username or password", HttpStatus.UNAUTHORIZED);
    }

    public static BusinessException insufficientBalance() {
        return new BusinessException("INSUFFICIENT_BALANCE", "Insufficient balance");
    }

    public static BusinessException insufficientLoyaltyPoints() {
        return new BusinessException("INSUFFICIENT_POINTS", "Insufficient loyalty points");
    }

    public static BusinessException userNotActive() {
        return new BusinessException("USER_NOT_ACTIVE", "User account is not active");
    }

    public static BusinessException productNotFound() {
        return new BusinessException("PRODUCT_NOT_FOUND", "Product not found", HttpStatus.NOT_FOUND);
    }

    public static BusinessException insufficientStock() {
        return new BusinessException("INSUFFICIENT_STOCK", "Insufficient stock available");
    }

    public static BusinessException productNotActive() {
        return new BusinessException("PRODUCT_NOT_ACTIVE", "Product is not active");
    }

    public static BusinessException orderNotFound() {
        return new BusinessException("ORDER_NOT_FOUND", "Order not found", HttpStatus.NOT_FOUND);
    }

    public static BusinessException invalidOrderStatus() {
        return new BusinessException("INVALID_ORDER_STATUS", "Invalid order status for this operation");
    }

    public static BusinessException orderCannotBeCancelled() {
        return new BusinessException("ORDER_CANNOT_CANCEL", "Order cannot be cancelled");
    }

    public static BusinessException paymentFailed() {
        return new BusinessException("PAYMENT_FAILED", "Payment processing failed");
    }

    public static BusinessException invalidCoupon() {
        return new BusinessException("INVALID_COUPON", "Invalid or expired coupon");
    }
}
