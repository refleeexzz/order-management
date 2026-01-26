package com.ordermanagement.domain.enums;

/**
 * available payment methods - how customers can pay for their orders
 */
public enum PaymentMethod {
    CREDIT_CARD,
    DEBIT_CARD,
    PIX,
    BANK_SLIP,      // boleto bancario
    BANK_TRANSFER
}
