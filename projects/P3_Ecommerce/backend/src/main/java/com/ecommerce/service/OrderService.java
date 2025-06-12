package com.ecommerce.service;

import com.ecommerce.dto.CheckoutRequest;
import com.ecommerce.dto.OrderItemResponse;
import com.ecommerce.dto.OrderResponse;
import com.ecommerce.dto.OrderAnalyticsResponse;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.model.*;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.OrderItemRepository;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private ObjectMapper objectMapper;

    // Tax rate (8%)
    private static final BigDecimal TAX_RATE = new BigDecimal("0.08");
    
    // Free shipping threshold
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("50.00");
    
    // Standard shipping cost
    private static final BigDecimal STANDARD_SHIPPING_COST = new BigDecimal("10.00");

    /**
     * Create order from cart items
     */
    public OrderResponse createOrder(User user, CheckoutRequest checkoutRequest) {
        // Get cart items for the user
        List<CartItem> cartItems = cartItemRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        
        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        // Calculate totals
        BigDecimal subtotal = cartItems.stream()
                .map(cartItem -> BigDecimal.valueOf(cartItem.getTotalPrice()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal taxAmount = subtotal.multiply(TAX_RATE);
        BigDecimal shippingAmount = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0 
                ? BigDecimal.ZERO 
                : STANDARD_SHIPPING_COST;
        BigDecimal totalAmount = subtotal.add(taxAmount).add(shippingAmount);

        // Generate order number
        String orderNumber = generateOrderNumber();

        // Create order
        Order order = new Order();
        order.setUser(user);
        order.setOrderNumber(orderNumber);
        order.setSubtotal(subtotal);
        order.setTaxAmount(taxAmount);
        order.setShippingAmount(shippingAmount);
        order.setTotalAmount(totalAmount);
        order.setPaymentMethod(checkoutRequest.getPaymentMethod());
        order.setNotes(checkoutRequest.getNotes());

        // Convert addresses to JSON
        try {
            order.setShippingAddress(objectMapper.writeValueAsString(checkoutRequest.getShippingAddress()));
            order.setBillingAddress(objectMapper.writeValueAsString(checkoutRequest.getBillingAddress()));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error processing addresses", e);
        }

        // Save order
        order = orderRepository.save(order);

        // Create order items from cart items
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            
            // Check stock availability
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new IllegalArgumentException(
                    String.format("Insufficient stock for product %s. Available: %d, Requested: %d", 
                                product.getName(), product.getStockQuantity(), cartItem.getQuantity())
                );
            }

            // Create order item
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setProductSku(product.getSku());
            orderItem.setProductImageUrl(product.getImageUrl());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setTotalPrice(BigDecimal.valueOf(cartItem.getTotalPrice()));

            orderItemRepository.save(orderItem);

            // Update product stock
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);
        }

        // Clear cart after successful order creation
        cartItemRepository.deleteByUserId(user.getId());

        // Convert to response
        return convertToOrderResponse(order);
    }

    /**
     * Get order by ID
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return convertToOrderResponse(order);
    }

    /**
     * Get order by order number
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with order number: " + orderNumber));
        return convertToOrderResponse(order);
    }

    /**
     * Get orders by user
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUser(User user) {
        List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user);
        return orders.stream()
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get orders by user with pagination
     */
    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrdersByUser(User user, Pageable pageable) {
        Page<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        return orders.map(this::convertToOrderResponse);
    }

    /**
     * Get all orders with pagination (admin)
     */
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        Page<Order> orders = orderRepository.findRecentOrders(pageable);
        return orders.map(this::convertToOrderResponse);
    }

    /**
     * Update order status
     */
    public OrderResponse updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        order.setStatus(status);
        order = orderRepository.save(order);
        
        return convertToOrderResponse(order);
    }

    /**
     * Update payment status
     */
    public OrderResponse updatePaymentStatus(Long orderId, Order.PaymentStatus paymentStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        order.setPaymentStatus(paymentStatus);
        order = orderRepository.save(order);
        
        return convertToOrderResponse(order);
    }

    /**
     * Update payment intent ID
     */
    public OrderResponse updatePaymentIntentId(Long orderId, String paymentIntentId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        order.setPaymentIntentId(paymentIntentId);
        order = orderRepository.save(order);
        
        return convertToOrderResponse(order);
    }

    /**
     * Cancel order
     */
    public OrderResponse cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        if (!order.canBeCancelled()) {
            throw new IllegalArgumentException("Order cannot be cancelled in current status: " + order.getStatus());
        }
        
        order.setStatus(Order.OrderStatus.CANCELLED);
        order = orderRepository.save(order);
        
        // Restore product stock
        restoreProductStock(order);
        
        return convertToOrderResponse(order);
    }

    /**
     * Get order statistics
     */
    @Transactional(readOnly = true)
    public Object[] getOrderStatistics() {
        LocalDateTime startDate = LocalDateTime.now().minusMonths(1);
        return orderRepository.getOrderStatistics(startDate);
    }

    /**
     * Get total sales
     */
    @Transactional(readOnly = true)
    public Double getTotalSales() {
        return orderRepository.getTotalSales();
    }

    /**
     * Get total sales by user
     */
    @Transactional(readOnly = true)
    public Double getTotalSalesByUser(User user) {
        return orderRepository.getTotalSalesByUser(user);
    }

    // Helper methods

    private String generateOrderNumber() {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String random = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "ORD-" + timestamp + "-" + random;
    }

    private void restoreProductStock(Order order) {
        List<OrderItem> orderItems = orderItemRepository.findByOrderOrderById(order);
        
        for (OrderItem orderItem : orderItems) {
            Product product = orderItem.getProduct();
            product.setStockQuantity(product.getStockQuantity() + orderItem.getQuantity());
            productRepository.save(product);
        }
    }

    private OrderResponse convertToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        response.setStatus(order.getStatus());
        response.setSubtotal(order.getSubtotal());
        response.setTaxAmount(order.getTaxAmount());
        response.setShippingAmount(order.getShippingAmount());
        response.setTotalAmount(order.getTotalAmount());
        response.setPaymentStatus(order.getPaymentStatus());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setPaymentIntentId(order.getPaymentIntentId());
        response.setNotes(order.getNotes());
        response.setTotalItems(order.getTotalItems());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());
        
        // Set user information
        response.setUserId(order.getUser().getId());
        response.setUserEmail(order.getUser().getEmail());
        response.setUserName(order.getUser().getFirstName() + " " + order.getUser().getLastName());
        
        // Convert addresses
        try {
            CheckoutRequest.AddressRequest shippingAddress = objectMapper.readValue(
                order.getShippingAddress(), CheckoutRequest.AddressRequest.class);
            response.setShippingAddress(convertToAddressResponse(shippingAddress));
            
            CheckoutRequest.AddressRequest billingAddress = objectMapper.readValue(
                order.getBillingAddress(), CheckoutRequest.AddressRequest.class);
            response.setBillingAddress(convertToAddressResponse(billingAddress));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error parsing addresses", e);
        }
        
        // Convert order items
        List<OrderItem> orderItems = orderItemRepository.findByOrderOrderById(order);
        List<OrderItemResponse> orderItemResponses = orderItems.stream()
                .map(this::convertToOrderItemResponse)
                .collect(Collectors.toList());
        response.setOrderItems(orderItemResponses);
        
        return response;
    }

    private OrderItemResponse convertToOrderItemResponse(OrderItem orderItem) {
        OrderItemResponse response = new OrderItemResponse();
        response.setId(orderItem.getId());
        response.setProductId(orderItem.getProduct().getId());
        response.setProductName(orderItem.getProductName());
        response.setProductSku(orderItem.getProductSku());
        response.setProductImageUrl(orderItem.getProductImageUrl());
        response.setUnitPrice(orderItem.getUnitPrice());
        response.setQuantity(orderItem.getQuantity());
        response.setTotalPrice(orderItem.getTotalPrice());
        response.setCreatedAt(orderItem.getCreatedAt());
        response.setUpdatedAt(orderItem.getUpdatedAt());
        return response;
    }

    private OrderResponse.AddressResponse convertToAddressResponse(CheckoutRequest.AddressRequest address) {
        return new OrderResponse.AddressResponse(
            address.getFirstName(),
            address.getLastName(),
            address.getAddressLine1(),
            address.getAddressLine2(),
            address.getCity(),
            address.getState(),
            address.getPostalCode(),
            address.getCountry(),
            address.getPhoneNumber()
        );
    }

    /**
     * Create a payment intent for an order
     */
    public com.ecommerce.dto.PaymentIntentResponse createPaymentIntentForOrder(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderNumber));

        com.ecommerce.dto.PaymentIntentRequest request = new com.ecommerce.dto.PaymentIntentRequest();
        request.setAmount(order.getTotalAmount());
        request.setCurrency("usd");
        request.setDescription("Payment for order #" + orderNumber);
        request.setOrderId(orderNumber);
        request.setCustomerId(order.getUser().getId().toString());

        return paymentService.createPaymentIntent(request);
    }

    /**
     * Get all orders with advanced filtering (admin only)
     */
    public Page<OrderResponse> getAllOrdersWithFilters(Pageable pageable, String status, String paymentStatus, 
                                                      String search, String startDate, String endDate, 
                                                      Double minAmount, Double maxAmount) {
        // Convert String parameters to appropriate types
        Order.OrderStatus orderStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                orderStatus = Order.OrderStatus.valueOf(status);
            } catch (IllegalArgumentException e) {
                // Invalid status, will be ignored
            }
        }
        
        Order.PaymentStatus orderPaymentStatus = null;
        if (paymentStatus != null && !paymentStatus.isEmpty()) {
            try {
                orderPaymentStatus = Order.PaymentStatus.valueOf(paymentStatus);
            } catch (IllegalArgumentException e) {
                // Invalid payment status, will be ignored
            }
        }
        
        LocalDateTime startDateTime = null;
        if (startDate != null && !startDate.isEmpty()) {
            try {
                startDateTime = LocalDateTime.parse(startDate + "T00:00:00");
            } catch (Exception e) {
                // Invalid date format, will be ignored
            }
        }
        
        LocalDateTime endDateTime = null;
        if (endDate != null && !endDate.isEmpty()) {
            try {
                endDateTime = LocalDateTime.parse(endDate + "T23:59:59");
            } catch (Exception e) {
                // Invalid date format, will be ignored
            }
        }
        
        return orderRepository.findAllWithFilters(pageable, orderStatus, orderPaymentStatus, search, 
                                                startDateTime, endDateTime, minAmount, maxAmount)
                .map(this::convertToOrderResponse);
    }

    /**
     * Bulk update order status (admin only)
     */
    @Transactional
    public List<OrderResponse> bulkUpdateOrderStatus(List<Long> orderIds, Order.OrderStatus status) {
        List<Order> orders = orderRepository.findAllById(orderIds);
        orders.forEach(order -> order.setStatus(status));
        List<Order> savedOrders = orderRepository.saveAll(orders);
        return savedOrders.stream()
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());
    }

    /**
     * Bulk update payment status (admin only)
     */
    @Transactional
    public List<OrderResponse> bulkUpdatePaymentStatus(List<Long> orderIds, Order.PaymentStatus paymentStatus) {
        List<Order> orders = orderRepository.findAllById(orderIds);
        orders.forEach(order -> order.setPaymentStatus(paymentStatus));
        List<Order> savedOrders = orderRepository.saveAll(orders);
        return savedOrders.stream()
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get orders by date range (admin only)
     */
    public Page<OrderResponse> getOrdersByDateRange(String startDate, String endDate, Pageable pageable) {
        LocalDateTime start = LocalDateTime.parse(startDate + "T00:00:00");
        LocalDateTime end = LocalDateTime.parse(endDate + "T23:59:59");
        
        Page<Order> orders = orderRepository.findByCreatedAtBetween(start, end, pageable);
        return orders.map(this::convertToOrderResponse);
    }

    /**
     * Get orders by customer (admin only)
     */
    public Page<OrderResponse> getOrdersByCustomer(Long customerId, Pageable pageable) {
        Page<Order> orders = orderRepository.findByUserId(customerId, pageable);
        return orders.map(this::convertToOrderResponse);
    }

    /**
     * Get order analytics (admin only)
     */
    public OrderAnalyticsResponse getOrderAnalytics(String startDate, String endDate) {
        LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate + "T00:00:00") : null;
        LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate + "T23:59:59") : null;
        
        OrderAnalyticsResponse analytics = new OrderAnalyticsResponse();
        
        // Basic counts
        Long totalOrders = orderRepository.countByDateRange(start, end);
        analytics.setTotalOrders(totalOrders);
        
        // Status counts
        analytics.setPendingOrders(orderRepository.countByStatusAndDateRange(Order.OrderStatus.PENDING, start, end));
        analytics.setProcessingOrders(orderRepository.countByStatusAndDateRange(Order.OrderStatus.PROCESSING, start, end));
        analytics.setShippedOrders(orderRepository.countByStatusAndDateRange(Order.OrderStatus.SHIPPED, start, end));
        analytics.setDeliveredOrders(orderRepository.countByStatusAndDateRange(Order.OrderStatus.DELIVERED, start, end));
        analytics.setCancelledOrders(orderRepository.countByStatusAndDateRange(Order.OrderStatus.CANCELLED, start, end));
        
        // Payment status counts
        analytics.setPaidOrders(orderRepository.countByPaymentStatusAndDateRange(Order.PaymentStatus.PAID, start, end));
        analytics.setPendingPaymentOrders(orderRepository.countByPaymentStatusAndDateRange(Order.PaymentStatus.PENDING, start, end));
        analytics.setFailedPaymentOrders(orderRepository.countByPaymentStatusAndDateRange(Order.PaymentStatus.FAILED, start, end));
        analytics.setRefundedOrders(orderRepository.countByPaymentStatusAndDateRange(Order.PaymentStatus.REFUNDED, start, end));
        
        // Revenue calculations
        BigDecimal totalRevenue = orderRepository.getTotalRevenueByDateRange(start, end);
        analytics.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        
        if (totalOrders > 0 && totalRevenue != null) {
            analytics.setAverageOrderValue(totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP));
        } else {
            analytics.setAverageOrderValue(BigDecimal.ZERO);
        }
        
        // Additional revenue breakdown
        BigDecimal totalTax = orderRepository.getTotalTaxByDateRange(start, end);
        BigDecimal totalShipping = orderRepository.getTotalShippingByDateRange(start, end);
        analytics.setTotalTax(totalTax != null ? totalTax : BigDecimal.ZERO);
        analytics.setTotalShipping(totalShipping != null ? totalShipping : BigDecimal.ZERO);
        
        // Set period
        analytics.setPeriodStart(start);
        analytics.setPeriodEnd(end);
        
        return analytics;
    }

    /**
     * Export orders to CSV (admin only)
     */
    public String exportOrdersToCSV(String status, String paymentStatus, String startDate, String endDate) {
        StringBuilder csv = new StringBuilder();
        csv.append("Order Number,Status,Payment Status,Customer Email,Total Amount,Subtotal,Tax,Shipping,Created At\n");
        
        // Convert String parameters to appropriate types
        Order.OrderStatus orderStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                orderStatus = Order.OrderStatus.valueOf(status);
            } catch (IllegalArgumentException e) {
                // Invalid status, will be ignored
            }
        }
        
        Order.PaymentStatus orderPaymentStatus = null;
        if (paymentStatus != null && !paymentStatus.isEmpty()) {
            try {
                orderPaymentStatus = Order.PaymentStatus.valueOf(paymentStatus);
            } catch (IllegalArgumentException e) {
                // Invalid payment status, will be ignored
            }
        }
        
        LocalDateTime startDateTime = null;
        if (startDate != null && !startDate.isEmpty()) {
            try {
                startDateTime = LocalDateTime.parse(startDate + "T00:00:00");
            } catch (Exception e) {
                // Invalid date format, will be ignored
            }
        }
        
        LocalDateTime endDateTime = null;
        if (endDate != null && !endDate.isEmpty()) {
            try {
                endDateTime = LocalDateTime.parse(endDate + "T23:59:59");
            } catch (Exception e) {
                // Invalid date format, will be ignored
            }
        }
        
        List<Order> orders = orderRepository.findForExport(orderStatus, orderPaymentStatus, startDateTime, endDateTime);
        
        for (Order order : orders) {
            csv.append(order.getOrderNumber()).append(",");
            csv.append(order.getStatus()).append(",");
            csv.append(order.getPaymentStatus()).append(",");
            csv.append(order.getUser().getEmail()).append(",");
            csv.append(order.getTotalAmount()).append(",");
            csv.append(order.getSubtotal()).append(",");
            csv.append(order.getTaxAmount()).append(",");
            csv.append(order.getShippingAmount()).append(",");
            csv.append(order.getCreatedAt()).append("\n");
        }
        
        return csv.toString();
    }
}
