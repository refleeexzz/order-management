package com.ordermanagement.domain.enums;

/**
 * order lifecycle status - tracks where the order is in the process
 */
public enum OrderStatus {
    PENDING_PAYMENT,    // order created, waiting for payment
    PAID,               // payment confirmed, ready to process
    PROCESSING,         // being prepared for shipping
    SHIPPED,            // on its way to the customer
    DELIVERED,          // successfully delivered
    CANCELLED           // order was cancelled
}
