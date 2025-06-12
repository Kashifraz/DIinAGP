package com.ecommerce.controller;

import com.ecommerce.dto.CartItemRequest;
import com.ecommerce.dto.CartItemResponse;
import com.ecommerce.dto.CartSummaryResponse;
import com.ecommerce.model.User;
import com.ecommerce.service.CartService;
import com.ecommerce.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/cart")
@CrossOrigin(origins = "*")
public class CartController {

      @GetMapping("/public-test")
    public ResponseEntity<String> publicTest() {
        return ResponseEntity.ok("Cart controller PUBLIC endpoint is working!");
    }
    
    @Autowired
    private CartService cartService;
    
    @Autowired
    private UserService userService;
    
    // Add item to cart
    @PostMapping("/items")
    public ResponseEntity<CartItemResponse> addToCart(
            @Valid @RequestBody CartItemRequest request,
            Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            CartItemResponse response = cartService.addToCart(user.getId(), request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Get all cart items
    @GetMapping("/items")
    public ResponseEntity<List<CartItemResponse>> getCartItems(Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            List<CartItemResponse> items = cartService.getCartItems(user.getId());
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get cart summary
    @GetMapping("/summary")
    public ResponseEntity<CartSummaryResponse> getCartSummary(Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            CartSummaryResponse summary = cartService.getCartSummary(user.getId());
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Update cart item quantity
    @PutMapping("/items/{productId}")
    public ResponseEntity<CartItemResponse> updateCartItemQuantity(
            @PathVariable Long productId,
            @RequestParam Integer quantity,
            Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            CartItemResponse response = cartService.updateCartItemQuantity(user.getId(), productId, quantity);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Remove item from cart
    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Void> removeFromCart(
            @PathVariable Long productId,
            Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            cartService.removeFromCart(user.getId(), productId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Clear entire cart
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            cartService.clearCart(user.getId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get cart item count
    @GetMapping("/count")
    public ResponseEntity<Long> getCartItemCount(Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            Long count = cartService.getCartItemCount(user.getId());
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get cart total quantity
    @GetMapping("/total-quantity")
    public ResponseEntity<Long> getCartTotalQuantity(Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            Long totalQuantity = cartService.getCartTotalQuantity(user.getId());
            return ResponseEntity.ok(totalQuantity);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Check if cart is empty
    @GetMapping("/empty")
    public ResponseEntity<Boolean> isCartEmpty(Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            Boolean isEmpty = cartService.isCartEmpty(user.getId());
            return ResponseEntity.ok(isEmpty);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Check if product is in cart
    @GetMapping("/contains/{productId}")
    public ResponseEntity<Boolean> isProductInCart(
            @PathVariable Long productId,
            Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            Boolean isInCart = cartService.isProductInCart(user.getId(), productId);
            return ResponseEntity.ok(isInCart);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get specific cart item
    @GetMapping("/items/{productId}")
    public ResponseEntity<CartItemResponse> getCartItem(
            @PathVariable Long productId,
            Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            return cartService.getCartItem(user.getId(), productId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Test endpoint to verify cart controller is working
    @GetMapping("/test")
    public ResponseEntity<String> testCartEndpoint() {
        return ResponseEntity.ok("Cart controller is working!");
    }
    
    // Helper method to get current user
    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
