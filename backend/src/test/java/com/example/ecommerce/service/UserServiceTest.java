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

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("User Service Tests")
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
                .password("password123")
                .email("test@example.com")
                .firstName("Test")
                .lastName("User")
                .phone("1234567890")
                .address("123 Test St")
                .role(User.UserRole.CUSTOMER)
                .status(User.UserStatus.ACTIVE)
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Should create user successfully")
    void createUser_Success() {
        // Given
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        User result = userService.createUser(testUser);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("testuser", result.getUsername());
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Should throw exception when username already exists")
    void createUser_UsernameExists() {
        // Given
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.createUser(testUser));
        assertEquals("Username already exists", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when email already exists")
    void createUser_EmailExists() {
        // Given
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.createUser(testUser));
        assertEquals("Email already exists", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should get user by ID successfully")
    void getUserById_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // When
        Optional<User> result = userService.getUserById(1L);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testUser, result.get());
    }

    @Test
    @DisplayName("Should return empty optional when user not found")
    void getUserById_NotFound() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // When
        Optional<User> result = userService.getUserById(1L);

        // Then
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Should get all users")
    void getAllUsers_Success() {
        // Given
        User user2 = User.builder()
                .id(2L)
                .username("user2")
                .email("user2@example.com")
                .build();
        List<User> users = Arrays.asList(testUser, user2);
        when(userRepository.findAll()).thenReturn(users);

        // When
        List<User> result = userService.getAllUsers();

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("Should get active users")
    void getActiveUsers_Success() {
        // Given
        List<User> users = Arrays.asList(testUser);
        when(userRepository.findByActiveTrue()).thenReturn(users);

        // When
        List<User> result = userService.getActiveUsers();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).getActive());
    }

    @Test
    @DisplayName("Should update user successfully")
    void updateUser_Success() {
        // Given
        User updatedDetails = User.builder()
                .email("updated@example.com")
                .phone("0987654321")
                .role(User.UserRole.ADMIN)
                .active(true)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        User result = userService.updateUser(1L, updatedDetails);

        // Then
        assertEquals("updated@example.com", result.getEmail());
        assertEquals("0987654321", result.getPhone());
        assertEquals(User.UserRole.ADMIN, result.getRole());
        assertTrue(result.getActive());
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent user")
    void updateUser_NotFound() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.updateUser(1L, testUser));
        assertEquals("User not found", exception.getMessage());
    }

    @Test
    @DisplayName("Should delete user by setting active to false")
    void deleteUser_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        userService.deleteUser(1L);

        // Then
        assertFalse(testUser.getActive());
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent user")
    void deleteUser_NotFound() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.deleteUser(1L));
        assertEquals("User not found", exception.getMessage());
    }

    @Test
    @DisplayName("Should get active user count")
    void getActiveUserCount_Success() {
        // Given
        when(userRepository.countActiveUsers()).thenReturn(10L);

        // When
        Long result = userService.getActiveUserCount();

        // Then
        assertEquals(10L, result);
        verify(userRepository).countActiveUsers();
    }

    @Test
    @DisplayName("Should handle empty user list")
    void getAllUsers_Empty() {
        // Given
        when(userRepository.findAll()).thenReturn(Arrays.asList());

        // When
        List<User> result = userService.getAllUsers();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Should handle empty active users list")
    void getActiveUsers_Empty() {
        // Given
        when(userRepository.findByActiveTrue()).thenReturn(Arrays.asList());

        // When
        List<User> result = userService.getActiveUsers();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}
