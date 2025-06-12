package com.ecommerce.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

public class OrderAnalyticsResponse {
    
    private Long totalOrders;
    private Long pendingOrders;
    private Long processingOrders;
    private Long shippedOrders;
    private Long deliveredOrders;
    private Long cancelledOrders;
    
    private Long paidOrders;
    private Long pendingPaymentOrders;
    private Long failedPaymentOrders;
    private Long refundedOrders;
    
    private BigDecimal totalRevenue;
    private BigDecimal averageOrderValue;
    private BigDecimal totalTax;
    private BigDecimal totalShipping;
    
    private Map<String, Long> ordersByStatus;
    private Map<String, Long> ordersByPaymentStatus;
    private Map<String, BigDecimal> revenueByMonth;
    private Map<String, Long> ordersByMonth;
    
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    
    // Constructors
    public OrderAnalyticsResponse() {
    }
    
    public OrderAnalyticsResponse(Long totalOrders, BigDecimal totalRevenue, BigDecimal averageOrderValue) {
        this.totalOrders = totalOrders;
        this.totalRevenue = totalRevenue;
        this.averageOrderValue = averageOrderValue;
    }
    
    // Getters and Setters
    public Long getTotalOrders() {
        return totalOrders;
    }
    
    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }
    
    public Long getPendingOrders() {
        return pendingOrders;
    }
    
    public void setPendingOrders(Long pendingOrders) {
        this.pendingOrders = pendingOrders;
    }
    
    public Long getProcessingOrders() {
        return processingOrders;
    }
    
    public void setProcessingOrders(Long processingOrders) {
        this.processingOrders = processingOrders;
    }
    
    public Long getShippedOrders() {
        return shippedOrders;
    }
    
    public void setShippedOrders(Long shippedOrders) {
        this.shippedOrders = shippedOrders;
    }
    
    public Long getDeliveredOrders() {
        return deliveredOrders;
    }
    
    public void setDeliveredOrders(Long deliveredOrders) {
        this.deliveredOrders = deliveredOrders;
    }
    
    public Long getCancelledOrders() {
        return cancelledOrders;
    }
    
    public void setCancelledOrders(Long cancelledOrders) {
        this.cancelledOrders = cancelledOrders;
    }
    
    public Long getPaidOrders() {
        return paidOrders;
    }
    
    public void setPaidOrders(Long paidOrders) {
        this.paidOrders = paidOrders;
    }
    
    public Long getPendingPaymentOrders() {
        return pendingPaymentOrders;
    }
    
    public void setPendingPaymentOrders(Long pendingPaymentOrders) {
        this.pendingPaymentOrders = pendingPaymentOrders;
    }
    
    public Long getFailedPaymentOrders() {
        return failedPaymentOrders;
    }
    
    public void setFailedPaymentOrders(Long failedPaymentOrders) {
        this.failedPaymentOrders = failedPaymentOrders;
    }
    
    public Long getRefundedOrders() {
        return refundedOrders;
    }
    
    public void setRefundedOrders(Long refundedOrders) {
        this.refundedOrders = refundedOrders;
    }
    
    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }
    
    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }
    
    public BigDecimal getAverageOrderValue() {
        return averageOrderValue;
    }
    
    public void setAverageOrderValue(BigDecimal averageOrderValue) {
        this.averageOrderValue = averageOrderValue;
    }
    
    public BigDecimal getTotalTax() {
        return totalTax;
    }
    
    public void setTotalTax(BigDecimal totalTax) {
        this.totalTax = totalTax;
    }
    
    public BigDecimal getTotalShipping() {
        return totalShipping;
    }
    
    public void setTotalShipping(BigDecimal totalShipping) {
        this.totalShipping = totalShipping;
    }
    
    public Map<String, Long> getOrdersByStatus() {
        return ordersByStatus;
    }
    
    public void setOrdersByStatus(Map<String, Long> ordersByStatus) {
        this.ordersByStatus = ordersByStatus;
    }
    
    public Map<String, Long> getOrdersByPaymentStatus() {
        return ordersByPaymentStatus;
    }
    
    public void setOrdersByPaymentStatus(Map<String, Long> ordersByPaymentStatus) {
        this.ordersByPaymentStatus = ordersByPaymentStatus;
    }
    
    public Map<String, BigDecimal> getRevenueByMonth() {
        return revenueByMonth;
    }
    
    public void setRevenueByMonth(Map<String, BigDecimal> revenueByMonth) {
        this.revenueByMonth = revenueByMonth;
    }
    
    public Map<String, Long> getOrdersByMonth() {
        return ordersByMonth;
    }
    
    public void setOrdersByMonth(Map<String, Long> ordersByMonth) {
        this.ordersByMonth = ordersByMonth;
    }
    
    public LocalDateTime getPeriodStart() {
        return periodStart;
    }
    
    public void setPeriodStart(LocalDateTime periodStart) {
        this.periodStart = periodStart;
    }
    
    public LocalDateTime getPeriodEnd() {
        return periodEnd;
    }
    
    public void setPeriodEnd(LocalDateTime periodEnd) {
        this.periodEnd = periodEnd;
    }
    
    @Override
    public String toString() {
        return "OrderAnalyticsResponse{" +
                "totalOrders=" + totalOrders +
                ", pendingOrders=" + pendingOrders +
                ", processingOrders=" + processingOrders +
                ", shippedOrders=" + shippedOrders +
                ", deliveredOrders=" + deliveredOrders +
                ", cancelledOrders=" + cancelledOrders +
                ", paidOrders=" + paidOrders +
                ", pendingPaymentOrders=" + pendingPaymentOrders +
                ", failedPaymentOrders=" + failedPaymentOrders +
                ", refundedOrders=" + refundedOrders +
                ", totalRevenue=" + totalRevenue +
                ", averageOrderValue=" + averageOrderValue +
                ", totalTax=" + totalTax +
                ", totalShipping=" + totalShipping +
                ", ordersByStatus=" + ordersByStatus +
                ", ordersByPaymentStatus=" + ordersByPaymentStatus +
                ", revenueByMonth=" + revenueByMonth +
                ", ordersByMonth=" + ordersByMonth +
                ", periodStart=" + periodStart +
                ", periodEnd=" + periodEnd +
                '}';
    }
}
