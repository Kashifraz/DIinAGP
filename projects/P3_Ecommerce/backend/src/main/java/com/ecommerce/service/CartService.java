package com.ecommerce.service;

import com.ecommerce.dto.CartItemRequest;
import com.ecommerce.dto.CartItemResponse;
import com.ecommerce.dto.CartSummaryResponse;
import com.ecommerce.model.CartItem;
import com.ecommerce.model.Product;
import com.ecommerce.model.User;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartService {
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // Add item to cart
    public CartItemResponse addToCart(Long userId, CartItemRequest request) {
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Validate product exists and is active
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (!product.getIsActive()) {
            throw new RuntimeException("Product is not available");
        }
        
        // Check if product is in stock
        if (product.getStockQuantity() < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock. Available: " + product.getStockQuantity());
        }
        
        // Check if item already exists in cart
        Optional<CartItem> existingItem = cartItemRepository.findByUserIdAndProductId(userId, request.getProductId());
        
        CartItem cartItem;
        if (existingItem.isPresent()) {
            // Update existing item quantity
            cartItem = existingItem.get();
            int newQuantity = cartItem.getQuantity() + request.getQuantity();
            
            // Check stock again with new total quantity
            if (product.getStockQuantity() < newQuantity) {
                throw new RuntimeException("Insufficient stock. Available: " + product.getStockQuantity() + 
                                        ", Requested: " + newQuantity);
            }
            
            cartItem.setQuantity(newQuantity);
        } else {
            // Create new cart item
            cartItem = new CartItem(user, product, request.getQuantity());
        }
        
        CartItem savedItem = cartItemRepository.save(cartItem);
        return convertToResponse(savedItem);
    }
    
    // Get all cart items for a user
    public List<CartItemResponse> getCartItems(Long userId) {
        List<CartItem> cartItems = cartItemRepository.findByUserIdWithProductDetails(userId);
        return cartItems.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Update cart item quantity
    public CartItemResponse updateCartItemQuantity(Long userId, Long productId, Integer quantity) {
        if (quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }
        
        CartItem cartItem = cartItemRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        // Check stock availability
        Product product = cartItem.getProduct();
        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + product.getStockQuantity());
        }
        
        cartItem.setQuantity(quantity);
        CartItem savedItem = cartItemRepository.save(cartItem);
        return convertToResponse(savedItem);
    }
    
    // Remove item from cart
    public void removeFromCart(Long userId, Long productId) {
        CartItem cartItem = cartItemRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        cartItemRepository.delete(cartItem);
    }
    
    // Clear entire cart
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }
    
    // Get cart summary
    public CartSummaryResponse getCartSummary(Long userId) {
        List<CartItemResponse> items = getCartItems(userId);
        
        // Calculate totals
        Integer totalItems = items.size();
        Long totalQuantity = items.stream()
                .mapToLong(CartItemResponse::getQuantity)
                .sum();
        
        Double subtotal = items.stream()
                .mapToDouble(CartItemResponse::getTotalPrice)
                .sum();
        
        // For now, we'll use simple calculations
        // In a real application, you might have complex tax and shipping rules
        Double tax = subtotal * 0.08; // 8% tax
        Double shipping = subtotal > 50.0 ? 0.0 : 10.0; // Free shipping over $50
        Double grandTotal = subtotal + tax + shipping;
        
        return new CartSummaryResponse(
                items,
                totalItems,
                totalQuantity,
                subtotal,
                subtotal,
                tax,
                shipping,
                grandTotal
        );
    }
    
    // Get cart item count
    public Long getCartItemCount(Long userId) {
        return cartItemRepository.countByUserId(userId);
    }
    
    // Get cart total quantity
    public Long getCartTotalQuantity(Long userId) {
        return cartItemRepository.sumQuantityByUserId(userId);
    }
    
    // Check if cart is empty
    public boolean isCartEmpty(Long userId) {
        return cartItemRepository.isCartEmptyByUserId(userId);
    }
    
    // Check if product is in cart
    public boolean isProductInCart(Long userId, Long productId) {
        return cartItemRepository.existsByUserIdAndProductId(userId, productId);
    }
    
    // Get cart item by user and product
    public Optional<CartItemResponse> getCartItem(Long userId, Long productId) {
        return cartItemRepository.findByUserIdAndProductId(userId, productId)
                .map(this::convertToResponse);
    }
    
    // Convert CartItem entity to CartItemResponse DTO
    private CartItemResponse convertToResponse(CartItem cartItem) {
        Product product = cartItem.getProduct();
        
        return new CartItemResponse(
                cartItem.getId(),
                product.getId(),
                product.getName(),
                product.getImageUrl(),
                product.getPrice().doubleValue(),
                cartItem.getQuantity(),
                cartItem.getTotalPrice(),
                cartItem.getCreatedAt(),
                cartItem.getUpdatedAt()
        );
    }
}
