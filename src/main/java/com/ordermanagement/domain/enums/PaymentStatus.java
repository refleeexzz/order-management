package com.ordermanagement.domain.enums;

/**
 * payment status - tracks the state of a payment transaction
 */
public enum PaymentStatus {
    PENDING,    // waiting for payment processing
    PAID,       // payment successfully completed
    FAILED,     // payment attempt failed
    REFUNDED,   // money returned to customer
    CANCELLED   // payment was cancelled before processing
}
