package com.ordermanagement.domain.entity;

import com.ordermanagement.domain.enums.PaymentMethod;
import com.ordermanagement.domain.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidade Pagamento
 */
@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;

    @Column(name = "installments")
    @Builder.Default
    private Integer installments = 1;

    /**
     * Confirma o pagamento
     */
    public void confirm(String transactionId) {
        this.status = PaymentStatus.PAID;
        this.transactionId = transactionId;
        this.paidAt = LocalDateTime.now();
    }

    /**
     * Reembolsa o pagamento
     */
    public void refund() {
        if (this.status != PaymentStatus.PAID) {
            throw new IllegalStateException("Pagamento não pode ser reembolsado");
        }
        this.status = PaymentStatus.REFUNDED;
        this.refundedAt = LocalDateTime.now();
    }
}
