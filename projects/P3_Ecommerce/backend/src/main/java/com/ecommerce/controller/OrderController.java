package com.ecommerce.controller;

import com.ecommerce.dto.CheckoutRequest;
import com.ecommerce.dto.OrderResponse;
import com.ecommerce.dto.OrderAnalyticsResponse;
import com.ecommerce.model.Order;
import com.ecommerce.model.User;
import com.ecommerce.service.OrderService;
import com.ecommerce.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    /**
     * Create order from cart
     */
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@Valid @RequestBody CheckoutRequest checkoutRequest, 
                                    Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            OrderResponse order = orderService.createOrder(user, checkoutRequest);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Get order by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id, Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            OrderResponse order = orderService.getOrderById(id);
            
            // Check if user owns the order or is admin
            if (!order.getUserId().equals(user.getId()) && !user.getRole().name().equals("ADMIN")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Access denied"));
            }
            
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Get order by order number
     */
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<?> getOrderByOrderNumber(@PathVariable String orderNumber, 
                                                 Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            OrderResponse order = orderService.getOrderByOrderNumber(orderNumber);
            
            // Check if user owns the order or is admin
            if (!order.getUserId().equals(user.getId()) && !user.getRole().name().equals("ADMIN")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Access denied"));
            }
            
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Get user's orders
     */
    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(@RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "10") int size,
                                       @RequestParam(defaultValue = "createdAt") String sortBy,
                                       @RequestParam(defaultValue = "desc") String sortDir,
                                       Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<OrderResponse> orders = orderService.getOrdersByUser(user, pageable);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Get all orders (admin only) with advanced filtering
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllOrders(@RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size,
                                        @RequestParam(defaultValue = "createdAt") String sortBy,
                                        @RequestParam(defaultValue = "desc") String sortDir,
                                        @RequestParam(required = false) String status,
                                        @RequestParam(required = false) String paymentStatus,
                                        @RequestParam(required = false) String search,
                                        @RequestParam(required = false) String startDate,
                                        @RequestParam(required = false) String endDate,
                                        @RequestParam(required = false) Double minAmount,
                                        @RequestParam(required = false) Double maxAmount) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<OrderResponse> orders = orderService.getAllOrdersWithFilters(
                pageable, status, paymentStatus, search, startDate, endDate, minAmount, maxAmount);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Update order status (admin only)
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, 
                                             @RequestParam String status) {
        try {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            OrderResponse order = orderService.updateOrderStatus(id, orderStatus);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Invalid status: " + status));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Update payment status (admin only)
     */
    @PutMapping("/{id}/payment-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updatePaymentStatus(@PathVariable Long id, 
                                               @RequestParam String paymentStatus) {
        try {
            Order.PaymentStatus status = Order.PaymentStatus.valueOf(paymentStatus.toUpperCase());
            OrderResponse order = orderService.updatePaymentStatus(id, status);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Invalid payment status: " + paymentStatus));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Update payment intent ID
     */
    @PutMapping("/{id}/payment-intent")
    public ResponseEntity<?> updatePaymentIntentId(@PathVariable Long id, 
                                                 @RequestParam String paymentIntentId,
                                                 Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            OrderResponse order = orderService.getOrderById(id);
            
            // Check if user owns the order or is admin
            if (!order.getUserId().equals(user.getId()) && !user.getRole().name().equals("ADMIN")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Access denied"));
            }
            
            OrderResponse updatedOrder = orderService.updatePaymentIntentId(id, paymentIntentId);
            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Cancel order
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id, Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            OrderResponse order = orderService.getOrderById(id);
            
            // Check if user owns the order or is admin
            if (!order.getUserId().equals(user.getId()) && !user.getRole().name().equals("ADMIN")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Access denied"));
            }
            
            OrderResponse cancelledOrder = orderService.cancelOrder(id);
            return ResponseEntity.ok(cancelledOrder);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Get order statistics (admin only)
     */
    @GetMapping("/admin/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getOrderStatistics() {
        try {
            Object[] stats = orderService.getOrderStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Get total sales (admin only)
     */
    @GetMapping("/admin/total-sales")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getTotalSales() {
        try {
            Double totalSales = orderService.getTotalSales();
            return ResponseEntity.ok(new SalesResponse(totalSales));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Bulk update order status (admin only)
     */
    @PutMapping("/admin/bulk-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> bulkUpdateOrderStatus(@RequestBody BulkStatusUpdateRequest request) {
        try {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(request.getStatus().toUpperCase());
            List<OrderResponse> updatedOrders = orderService.bulkUpdateOrderStatus(request.getOrderIds(), orderStatus);
            return ResponseEntity.ok(new BulkUpdateResponse(updatedOrders.size(), updatedOrders));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Invalid status: " + request.getStatus()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Bulk update payment status (admin only)
     */
    @PutMapping("/admin/bulk-payment-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> bulkUpdatePaymentStatus(@RequestBody BulkPaymentStatusUpdateRequest request) {
        try {
            Order.PaymentStatus paymentStatus = Order.PaymentStatus.valueOf(request.getPaymentStatus().toUpperCase());
            List<OrderResponse> updatedOrders = orderService.bulkUpdatePaymentStatus(request.getOrderIds(), paymentStatus);
            return ResponseEntity.ok(new BulkUpdateResponse(updatedOrders.size(), updatedOrders));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Invalid payment status: " + request.getPaymentStatus()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Get orders by date range (admin only)
     */
    @GetMapping("/admin/by-date-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getOrdersByDateRange(@RequestParam String startDate,
                                                @RequestParam String endDate,
                                                @RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<OrderResponse> orders = orderService.getOrdersByDateRange(startDate, endDate, pageable);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Get orders by customer (admin only)
     */
    @GetMapping("/admin/by-customer/{customerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getOrdersByCustomer(@PathVariable Long customerId,
                                               @RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<OrderResponse> orders = orderService.getOrdersByCustomer(customerId, pageable);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Get order analytics (admin only)
     */
    @GetMapping("/admin/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getOrderAnalytics(@RequestParam(required = false) String startDate,
                                            @RequestParam(required = false) String endDate) {
        try {
            OrderAnalyticsResponse analytics = orderService.getOrderAnalytics(startDate, endDate);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Export orders to CSV (admin only)
     */
    @GetMapping("/admin/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> exportOrders(@RequestParam(required = false) String status,
                                        @RequestParam(required = false) String paymentStatus,
                                        @RequestParam(required = false) String startDate,
                                        @RequestParam(required = false) String endDate) {
        try {
            String csvContent = orderService.exportOrdersToCSV(status, paymentStatus, startDate, endDate);
            return ResponseEntity.ok()
                    .header("Content-Type", "text/csv")
                    .header("Content-Disposition", "attachment; filename=orders.csv")
                    .body(csvContent);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Get user's total sales
     */
    @GetMapping("/my-total-sales")
    public ResponseEntity<?> getMyTotalSales(Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            Double totalSales = orderService.getTotalSalesByUser(user);
            return ResponseEntity.ok(new SalesResponse(totalSales));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    // Helper method to get current user
    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Inner classes for responses
    private static class ErrorResponse {
        private String error;

        public ErrorResponse(String error) {
            this.error = error;
        }

        public String getError() {
            return error;
        }

        public void setError(String error) {
            this.error = error;
        }
    }

    /**
     * Create payment intent for order
     */
    @PostMapping("/{orderNumber}/payment-intent")
    public ResponseEntity<?> createPaymentIntent(@PathVariable String orderNumber, Authentication authentication) {
        try {
            User user = getCurrentUser(authentication);
            OrderResponse order = orderService.getOrderByOrderNumber(orderNumber);
            
            // Check if user owns the order
            if (!order.getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Access denied"));
            }

            com.ecommerce.dto.PaymentIntentResponse paymentIntent = orderService.createPaymentIntentForOrder(orderNumber);
            
            return ResponseEntity.ok(paymentIntent);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }

    private static class SalesResponse {
        private Double totalSales;

        public SalesResponse(Double totalSales) {
            this.totalSales = totalSales;
        }

        public Double getTotalSales() {
            return totalSales;
        }

        public void setTotalSales(Double totalSales) {
            this.totalSales = totalSales;
        }
    }

    // DTOs for bulk operations
    private static class BulkStatusUpdateRequest {
        private List<Long> orderIds;
        private String status;

        public List<Long> getOrderIds() {
            return orderIds;
        }

        public void setOrderIds(List<Long> orderIds) {
            this.orderIds = orderIds;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    private static class BulkPaymentStatusUpdateRequest {
        private List<Long> orderIds;
        private String paymentStatus;

        public List<Long> getOrderIds() {
            return orderIds;
        }

        public void setOrderIds(List<Long> orderIds) {
            this.orderIds = orderIds;
        }

        public String getPaymentStatus() {
            return paymentStatus;
        }

        public void setPaymentStatus(String paymentStatus) {
            this.paymentStatus = paymentStatus;
        }
    }

    private static class BulkUpdateResponse {
        private int updatedCount;
        private List<OrderResponse> updatedOrders;

        public BulkUpdateResponse(int updatedCount, List<OrderResponse> updatedOrders) {
            this.updatedCount = updatedCount;
            this.updatedOrders = updatedOrders;
        }

        public int getUpdatedCount() {
            return updatedCount;
        }

        public void setUpdatedCount(int updatedCount) {
            this.updatedCount = updatedCount;
        }

        public List<OrderResponse> getUpdatedOrders() {
            return updatedOrders;
        }

        public void setUpdatedOrders(List<OrderResponse> updatedOrders) {
            this.updatedOrders = updatedOrders;
        }
    }
}
