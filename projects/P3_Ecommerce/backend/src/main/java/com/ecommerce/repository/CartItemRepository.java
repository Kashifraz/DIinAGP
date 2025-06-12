package com.ecommerce.repository;

import com.ecommerce.model.CartItem;
import com.ecommerce.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    // Find all cart items for a specific user
    List<CartItem> findByUserOrderByCreatedAtDesc(User user);
    
    // Find all cart items for a user by user ID
    List<CartItem> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Find a specific cart item by user and product
    Optional<CartItem> findByUserAndProduct(User user, com.ecommerce.model.Product product);
    
    // Find a specific cart item by user ID and product ID
    Optional<CartItem> findByUserIdAndProductId(Long userId, Long productId);
    
    // Check if a cart item exists for user and product
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    
    // Count total items in cart for a user
    @Query("SELECT COUNT(c) FROM CartItem c WHERE c.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);
    
    // Count total quantity of items in cart for a user
    @Query("SELECT COALESCE(SUM(c.quantity), 0) FROM CartItem c WHERE c.user.id = :userId")
    Long sumQuantityByUserId(@Param("userId") Long userId);
    
    // Calculate total price of cart for a user
    @Query("SELECT COALESCE(SUM(c.quantity * c.product.price), 0.0) FROM CartItem c WHERE c.user.id = :userId")
    Double calculateTotalPriceByUserId(@Param("userId") Long userId);
    
    // Delete all cart items for a user
    void deleteByUserId(Long userId);
    
    // Delete a specific cart item by user and product
    void deleteByUserIdAndProductId(Long userId, Long productId);
    
    // Update quantity for a specific cart item
    @Modifying
    @Query("UPDATE CartItem c SET c.quantity = :quantity WHERE c.user.id = :userId AND c.product.id = :productId")
    int updateQuantityByUserIdAndProductId(@Param("userId") Long userId, @Param("productId") Long productId, @Param("quantity") Integer quantity);
    
    // Find cart items with product details (for cart display)
    @Query("SELECT c FROM CartItem c " +
           "JOIN FETCH c.product p " +
           "WHERE c.user.id = :userId " +
           "ORDER BY c.createdAt DESC")
    List<CartItem> findByUserIdWithProductDetails(@Param("userId") Long userId);
    
    // Check if cart is empty for a user
    @Query("SELECT CASE WHEN COUNT(c) = 0 THEN true ELSE false END FROM CartItem c WHERE c.user.id = :userId")
    boolean isCartEmptyByUserId(@Param("userId") Long userId);
}
