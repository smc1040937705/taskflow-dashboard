package com.example.ecommerce.service;

import com.example.ecommerce.entity.User;
import com.example.ecommerce.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User testUser1;
    private User testUser2;

    @BeforeEach
    void setUp() {
        testUser1 = User.builder()
                .id(1L)
                .username("testuser1")
                .email("test1@example.com")
                .password("password123")
                .phone("1234567890")
                .role(User.UserRole.CUSTOMER)
                .status(User.UserStatus.ACTIVE)
                .active(true)
                .balance(BigDecimal.valueOf(1000))
                .loyaltyPoints(100)
                .build();

        testUser2 = User.builder()
                .id(2L)
                .username("testuser2")
                .email("test2@example.com")
                .password("password456")
                .phone("0987654321")
                .role(User.UserRole.ADMIN)
                .status(User.UserStatus.ACTIVE)
                .active(true)
                .balance(BigDecimal.valueOf(2000))
                .loyaltyPoints(200)
                .build();
    }

    @Test
    @DisplayName("Should create user successfully")
    void createUser_Success() {
        when(userRepository.existsByUsername("testuser1")).thenReturn(false);
        when(userRepository.existsByEmail("test1@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser1);

        User result = userService.createUser(testUser1);

        assertNotNull(result);
        assertEquals("testuser1", result.getUsername());
        verify(userRepository).save(testUser1);
    }

    @Test
    @DisplayName("Should throw exception when username already exists")
    void createUser_UsernameExists() {
        when(userRepository.existsByUsername("testuser1")).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.createUser(testUser1);
        });

        assertEquals("Username already exists", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when email already exists")
    void createUser_EmailExists() {
        when(userRepository.existsByUsername("testuser1")).thenReturn(false);
        when(userRepository.existsByEmail("test1@example.com")).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.createUser(testUser1);
        });

        assertEquals("Email already exists", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should get user by id")
    void getUserById_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser1));

        Optional<User> result = userService.getUserById(1L);

        assertTrue(result.isPresent());
        assertEquals("testuser1", result.get().getUsername());
    }

    @Test
    @DisplayName("Should return empty when user not found")
    void getUserById_NotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<User> result = userService.getUserById(999L);

        assertFalse(result.isPresent());
    }

    @Test
    @DisplayName("Should get all users")
    void getAllUsers_Success() {
        List<User> users = Arrays.asList(testUser1, testUser2);
        when(userRepository.findAll()).thenReturn(users);

        List<User> result = userService.getAllUsers();

        assertNotNull(result);
        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("Should get active users")
    void getActiveUsers_Success() {
        List<User> users = Arrays.asList(testUser1, testUser2);
        when(userRepository.findByActiveTrue()).thenReturn(users);

        List<User> result = userService.getActiveUsers();

        assertNotNull(result);
        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("Should update user successfully")
    void updateUser_Success() {
        User updatedDetails = User.builder()
                .email("updated@example.com")
                .phone("9999999999")
                .role(User.UserRole.VIP)
                .active(true)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser1));
        when(userRepository.save(any(User.class))).thenReturn(testUser1);

        User result = userService.updateUser(1L, updatedDetails);

        assertNotNull(result);
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent user")
    void updateUser_NotFound() {
        User updatedDetails = User.builder()
                .email("updated@example.com")
                .build();

        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.updateUser(999L, updatedDetails);
        });

        assertEquals("User not found", exception.getMessage());
    }

    @Test
    @DisplayName("Should delete user (soft delete)")
    void deleteUser_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser1));
        when(userRepository.save(any(User.class))).thenReturn(testUser1);

        userService.deleteUser(1L);

        assertFalse(testUser1.getActive());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent user")
    void deleteUser_NotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.deleteUser(999L);
        });

        assertEquals("User not found", exception.getMessage());
    }

    @Test
    @DisplayName("Should get active user count")
    void getActiveUserCount_Success() {
        when(userRepository.countActiveUsers()).thenReturn(5L);

        Long result = userService.getActiveUserCount();

        assertEquals(5L, result);
    }

    @Test
    @DisplayName("Should return zero when no active users")
    void getActiveUserCount_NoActiveUsers() {
        when(userRepository.countActiveUsers()).thenReturn(0L);

        Long result = userService.getActiveUserCount();

        assertEquals(0L, result);
    }
}
