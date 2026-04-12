package com.example.ecommerce.dto;

import com.example.ecommerce.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private Long id;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50)
    private String username;

    @NotBlank(message = "Email is required")
    @Email
    private String email;

    @Size(max = 100)
    private String firstName;

    @Size(max = 100)
    private String lastName;

    @Size(max = 20)
    private String phone;

    private String address;

    private User.UserRole role;

    private User.UserStatus status;

    private BigDecimal balance;

    private Integer loyaltyPoints;

    private LocalDateTime createdAt;

    private LocalDateTime lastLoginAt;

    private boolean emailVerified;

    public static UserDTO fromEntity(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(user.getRole())
                .status(user.getStatus())
                .balance(user.getBalance())
                .loyaltyPoints(user.getLoyaltyPoints())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .emailVerified(user.getEmailVerified() != null ? user.getEmailVerified() : false)
                .build();
    }
}
