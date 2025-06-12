package com.ecommerce.repository;

import com.ecommerce.model.Order;
import com.ecommerce.model.OrderItem;
import com.ecommerce.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    // Find order items by order
    List<OrderItem> findByOrderOrderById(Order order);
    
    // Find order items by product
    List<OrderItem> findByProductOrderByCreatedAtDesc(Product product);
    
    // Find order items by order and product
    List<OrderItem> findByOrderAndProduct(Order order, Product product);
    
    // Count order items by product
    long countByProduct(Product product);
    
    // Get total quantity sold for a product
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi WHERE oi.product = :product AND oi.order.paymentStatus = 'PAID'")
    Long getTotalQuantitySoldByProduct(@Param("product") Product product);
    
    // Get total revenue for a product
    @Query("SELECT COALESCE(SUM(oi.totalPrice), 0) FROM OrderItem oi WHERE oi.product = :product AND oi.order.paymentStatus = 'PAID'")
    Double getTotalRevenueByProduct(@Param("product") Product product);
    
    // Get top selling products
    @Query("SELECT oi.product, SUM(oi.quantity) as totalQuantity " +
           "FROM OrderItem oi " +
           "WHERE oi.order.paymentStatus = 'PAID' " +
           "GROUP BY oi.product " +
           "ORDER BY totalQuantity DESC")
    List<Object[]> getTopSellingProducts();
    
    // Get top selling products with limit
    @Query(value = "SELECT oi.product, SUM(oi.quantity) as totalQuantity " +
                   "FROM OrderItem oi " +
                   "WHERE oi.order.paymentStatus = 'PAID' " +
                   "GROUP BY oi.product " +
                   "ORDER BY totalQuantity DESC " +
                   "LIMIT :limit", nativeQuery = true)
    List<Object[]> getTopSellingProductsWithLimit(@Param("limit") int limit);
    
    // Get order items by multiple orders
    @Query("SELECT oi FROM OrderItem oi WHERE oi.order IN :orders ORDER BY oi.order.createdAt DESC, oi.id")
    List<OrderItem> findByOrderIn(@Param("orders") List<Order> orders);
    
    // Get order items by product and date range
    @Query("SELECT oi FROM OrderItem oi WHERE oi.product = :product AND oi.order.createdAt BETWEEN :startDate AND :endDate ORDER BY oi.order.createdAt DESC")
    List<OrderItem> findByProductAndCreatedAtBetween(@Param("product") Product product, 
                                                    @Param("startDate") java.time.LocalDateTime startDate, 
                                                    @Param("endDate") java.time.LocalDateTime endDate);
    
    // Get total quantity sold for a product in date range
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi WHERE oi.product = :product AND oi.order.paymentStatus = 'PAID' AND oi.order.createdAt BETWEEN :startDate AND :endDate")
    Long getTotalQuantitySoldByProductAndDateRange(@Param("product") Product product, 
                                                  @Param("startDate") java.time.LocalDateTime startDate, 
                                                  @Param("endDate") java.time.LocalDateTime endDate);
}
