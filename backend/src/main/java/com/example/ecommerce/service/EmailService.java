package com.example.ecommerce.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Async
    public void sendVerificationEmail(String email, String token) {
        System.out.println("Sending verification email to: " + email + " with token: " + token);
    }

    @Async
    public void sendPasswordResetEmail(String email, String token) {
        System.out.println("Sending password reset email to: " + email + " with token: " + token);
    }

    @Async
    public void sendOrderConfirmationEmail(String email, String orderNumber) {
        System.out.println("Sending order confirmation to: " + email + " for order: " + orderNumber);
    }

    @Async
    public void sendShippingNotificationEmail(String email, String orderNumber, String trackingNumber) {
        System.out.println("Sending shipping notification to: " + email + " for order: " + orderNumber);
    }

    public boolean isValidEmail(String email) {
        if (email == null || email.isEmpty()) {
            return false;
        }
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        return email.matches(emailRegex);
    }

    public String maskEmail(String email) {
        if (!isValidEmail(email)) {
            return "***";
        }
        int atIndex = email.indexOf('@');
        String username = email.substring(0, atIndex);
        String domain = email.substring(atIndex);
        if (username.length() <= 2) {
            return "***" + domain;
        }
        return username.charAt(0) + "***" + username.charAt(username.length() - 1) + domain;
    }
}
