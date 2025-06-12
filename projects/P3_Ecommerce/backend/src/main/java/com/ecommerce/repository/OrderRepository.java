package com.ecommerce.repository;

import com.ecommerce.model.Order;
import com.ecommerce.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // Find orders by user
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    
    // Find orders by user with pagination
    Page<Order> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    // Find orders by user ID with pagination
    Page<Order> findByUserId(Long userId, Pageable pageable);
    
    // Find order by order number
    Optional<Order> findByOrderNumber(String orderNumber);
    
    // Find orders by status
    List<Order> findByStatusOrderByCreatedAtDesc(Order.OrderStatus status);
    
    // Find orders by payment status
    List<Order> findByPaymentStatusOrderByCreatedAtDesc(Order.PaymentStatus paymentStatus);
    
    // Find orders by user and status
    List<Order> findByUserAndStatusOrderByCreatedAtDesc(User user, Order.OrderStatus status);
    
    // Find orders by user and payment status
    List<Order> findByUserAndPaymentStatusOrderByCreatedAtDesc(User user, Order.PaymentStatus paymentStatus);
    
    // Find orders created between dates
    List<Order> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime startDate, LocalDateTime endDate);
    
    // Find orders by user created between dates
    List<Order> findByUserAndCreatedAtBetweenOrderByCreatedAtDesc(User user, LocalDateTime startDate, LocalDateTime endDate);
    
    // Count orders by user
    long countByUser(User user);
    
    // Count orders by status
    long countByStatus(Order.OrderStatus status);
    
    // Count orders by payment status
    long countByPaymentStatus(Order.PaymentStatus paymentStatus);
    
    // Find orders by payment intent ID
    Optional<Order> findByPaymentIntentId(String paymentIntentId);
    
    // Get total sales amount for a user
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.user = :user AND o.paymentStatus = 'PAID'")
    Double getTotalSalesByUser(@Param("user") User user);
    
    // Get total sales amount for all users
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.paymentStatus = 'PAID'")
    Double getTotalSales();
    
    // Get total sales amount for a date range
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.paymentStatus = 'PAID' AND o.createdAt BETWEEN :startDate AND :endDate")
    Double getTotalSalesByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Get order statistics
    @Query("SELECT " +
           "COUNT(o) as totalOrders, " +
           "COALESCE(SUM(CASE WHEN o.paymentStatus = 'PAID' THEN o.totalAmount ELSE 0 END), 0) as totalRevenue, " +
           "COALESCE(AVG(CASE WHEN o.paymentStatus = 'PAID' THEN o.totalAmount ELSE 0 END), 0) as averageOrderValue " +
           "FROM Order o WHERE o.createdAt >= :startDate")
    Object[] getOrderStatistics(@Param("startDate") LocalDateTime startDate);
    
    // Find recent orders for admin dashboard
    @Query("SELECT o FROM Order o ORDER BY o.createdAt DESC")
    Page<Order> findRecentOrders(Pageable pageable);
    
    // Find orders by multiple statuses
    @Query("SELECT o FROM Order o WHERE o.status IN :statuses ORDER BY o.createdAt DESC")
    List<Order> findByStatusIn(@Param("statuses") List<Order.OrderStatus> statuses);
    
    // Find orders by multiple payment statuses
    @Query("SELECT o FROM Order o WHERE o.paymentStatus IN :paymentStatuses ORDER BY o.createdAt DESC")
    List<Order> findByPaymentStatusIn(@Param("paymentStatuses") List<Order.PaymentStatus> paymentStatuses);
    
    // Find orders by date range
    Page<Order> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    // Advanced filtering for admin
    @Query("SELECT o FROM Order o WHERE " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:paymentStatus IS NULL OR o.paymentStatus = :paymentStatus) AND " +
           "(:search IS NULL OR o.orderNumber LIKE %:search% OR o.user.email LIKE %:search%) AND " +
           "(:startDate IS NULL OR o.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR o.createdAt <= :endDate) AND " +
           "(:minAmount IS NULL OR o.totalAmount >= :minAmount) AND " +
           "(:maxAmount IS NULL OR o.totalAmount <= :maxAmount)")
    Page<Order> findAllWithFilters(Pageable pageable, 
                                  @Param("status") Order.OrderStatus status,
                                  @Param("paymentStatus") Order.PaymentStatus paymentStatus,
                                  @Param("search") String search,
                                  @Param("startDate") LocalDateTime startDate,
                                  @Param("endDate") LocalDateTime endDate,
                                  @Param("minAmount") Double minAmount,
                                  @Param("maxAmount") Double maxAmount);
    
    // Count by date range
    @Query("SELECT COUNT(o) FROM Order o WHERE " +
           "(:startDate IS NULL OR o.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR o.createdAt <= :endDate)")
    Long countByDateRange(@Param("startDate") LocalDateTime startDate, 
                         @Param("endDate") LocalDateTime endDate);
    
    // Count by status and date range
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status AND " +
           "(:startDate IS NULL OR o.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR o.createdAt <= :endDate)")
    Long countByStatusAndDateRange(@Param("status") Order.OrderStatus status,
                                  @Param("startDate") LocalDateTime startDate,
                                  @Param("endDate") LocalDateTime endDate);
    
    // Count by payment status and date range
    @Query("SELECT COUNT(o) FROM Order o WHERE o.paymentStatus = :paymentStatus AND " +
           "(:startDate IS NULL OR o.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR o.createdAt <= :endDate)")
    Long countByPaymentStatusAndDateRange(@Param("paymentStatus") Order.PaymentStatus paymentStatus,
                                         @Param("startDate") LocalDateTime startDate,
                                         @Param("endDate") LocalDateTime endDate);
    
    // Get total revenue by date range
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.paymentStatus = 'PAID' AND " +
           "(:startDate IS NULL OR o.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR o.createdAt <= :endDate)")
    BigDecimal getTotalRevenueByDateRange(@Param("startDate") LocalDateTime startDate,
                                         @Param("endDate") LocalDateTime endDate);
    
    // Get total tax by date range
    @Query("SELECT SUM(o.taxAmount) FROM Order o WHERE o.paymentStatus = 'PAID' AND " +
           "(:startDate IS NULL OR o.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR o.createdAt <= :endDate)")
    BigDecimal getTotalTaxByDateRange(@Param("startDate") LocalDateTime startDate,
                                     @Param("endDate") LocalDateTime endDate);
    
    // Get total shipping by date range
    @Query("SELECT SUM(o.shippingAmount) FROM Order o WHERE o.paymentStatus = 'PAID' AND " +
           "(:startDate IS NULL OR o.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR o.createdAt <= :endDate)")
    BigDecimal getTotalShippingByDateRange(@Param("startDate") LocalDateTime startDate,
                                          @Param("endDate") LocalDateTime endDate);
    
    // Find orders for export
    @Query("SELECT o FROM Order o WHERE " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:paymentStatus IS NULL OR o.paymentStatus = :paymentStatus) AND " +
           "(:startDate IS NULL OR o.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR o.createdAt <= :endDate) " +
           "ORDER BY o.createdAt DESC")
    List<Order> findForExport(@Param("status") Order.OrderStatus status,
                             @Param("paymentStatus") Order.PaymentStatus paymentStatus,
                             @Param("startDate") LocalDateTime startDate,
                             @Param("endDate") LocalDateTime endDate);
}
