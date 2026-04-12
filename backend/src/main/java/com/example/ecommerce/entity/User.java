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
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(unique = true)
    private String email;
    
    private String firstName;
    
    private String lastName;
    
    private String phone;
    
    private String address;
    
    @Enumerated(EnumType.STRING)
    private UserRole role;
    
    @Enumerated(EnumType.STRING)
    private UserStatus status;
    
    private BigDecimal balance;
    
    private Integer loyaltyPoints;
    
    private Boolean emailVerified;
    
    private Boolean active;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime lastLogin;
    
    private LocalDateTime lastLoginAt;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Order> orders = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (active == null) active = true;
        if (status == null) status = UserStatus.ACTIVE;
        if (balance == null) balance = BigDecimal.ZERO;
        if (loyaltyPoints == null) loyaltyPoints = 0;
        if (emailVerified == null) emailVerified = false;
    }
    
    public enum UserRole {
        ADMIN, CUSTOMER, VIP
    }
    
    public enum UserStatus {
        ACTIVE, INACTIVE, SUSPENDED, DELETED
    }
}
