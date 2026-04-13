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
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("password123")
                .role(User.UserRole.CUSTOMER)
                .active(true)
                .balance(BigDecimal.valueOf(1000))
                .loyaltyPoints(500)
                .build();
    }

    @Test
    @DisplayName("创建用户 - 成功")
    void createUser_Success() {
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        User result = userService.createUser(testUser);

        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("创建用户 - 用户名已存在")
    void createUser_UsernameExists() {
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.createUser(testUser);
        });

        assertEquals("Username already exists", exception.getMessage());
    }

    @Test
    @DisplayName("创建用户 - 邮箱已存在")
    void createUser_EmailExists() {
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.createUser(testUser);
        });

        assertEquals("Email already exists", exception.getMessage());
    }

    @Test
    @DisplayName("获取用户 - 成功")
    void getUserById_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        Optional<User> result = userService.getUserById(1L);

        assertTrue(result.isPresent());
        assertEquals("testuser", result.get().getUsername());
    }

    @Test
    @DisplayName("获取用户 - 不存在")
    void getUserById_NotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        Optional<User> result = userService.getUserById(1L);

        assertFalse(result.isPresent());
    }

    @Test
    @DisplayName("获取所有用户")
    void getAllUsers_Success() {
        when(userRepository.findAll()).thenReturn(Arrays.asList(testUser));

        List<User> result = userService.getAllUsers();

        assertEquals(1, result.size());
        assertEquals("testuser", result.get(0).getUsername());
    }

    @Test
    @DisplayName("获取活跃用户")
    void getActiveUsers_Success() {
        when(userRepository.findByActiveTrue()).thenReturn(Arrays.asList(testUser));

        List<User> result = userService.getActiveUsers();

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("更新用户 - 成功")
    void updateUser_Success() {
        User updatedDetails = User.builder()
                .email("newemail@example.com")
                .phone("1234567890")
                .role(User.UserRole.VIP)
                .active(true)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        User result = userService.updateUser(1L, updatedDetails);

        assertNotNull(result);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("更新用户 - 不存在")
    void updateUser_NotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.updateUser(1L, testUser);
        });

        assertEquals("User not found", exception.getMessage());
    }

    @Test
    @DisplayName("删除用户 - 成功")
    void deleteUser_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        assertDoesNotThrow(() -> userService.deleteUser(1L));
        
        verify(userRepository, times(1)).save(any(User.class));
        assertFalse(testUser.getActive());
    }

    @Test
    @DisplayName("删除用户 - 不存在")
    void deleteUser_NotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.deleteUser(1L);
        });

        assertEquals("User not found", exception.getMessage());
    }

    @Test
    @DisplayName("获取活跃用户数量")
    void getActiveUserCount_Success() {
        when(userRepository.countActiveUsers()).thenReturn(100L);

        Long result = userService.getActiveUserCount();

        assertEquals(100L, result);
    }
}