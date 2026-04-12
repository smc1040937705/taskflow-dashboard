package com.example.ecommerce.repository;

import com.example.ecommerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    List<User> findByActiveTrue();
    
    List<User> findByRole(User.UserRole role);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.active = true")
    Long countActiveUsers();
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
}
