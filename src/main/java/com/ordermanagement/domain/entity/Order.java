package com.ordermanagement.domain.entity;

import com.ordermanagement.domain.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidade Pedido
 */
@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends BaseEntity {

    @Column(name = "order_number", nullable = false, unique = true, length = 20)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "discount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(name = "shipping_cost", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal shippingCost = BigDecimal.ZERO;

    @Column(name = "total", nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "street", column = @Column(name = "shipping_street")),
        @AttributeOverride(name = "number", column = @Column(name = "shipping_number")),
        @AttributeOverride(name = "complement", column = @Column(name = "shipping_complement")),
        @AttributeOverride(name = "neighborhood", column = @Column(name = "shipping_neighborhood")),
        @AttributeOverride(name = "city", column = @Column(name = "shipping_city")),
        @AttributeOverride(name = "state", column = @Column(name = "shipping_state")),
        @AttributeOverride(name = "zipCode", column = @Column(name = "shipping_zip_code"))
    })
    private Address shippingAddress;

    @Column(length = 500)
    private String notes;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Payment payment;

    // ============ Métodos de Negócio ============

    /**
     * Adiciona um item ao pedido
     */
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
        recalculateTotal();
    }

    /**
     * Remove um item do pedido
     */
    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
        recalculateTotal();
    }

    /**
     * Recalcula os totais do pedido
     */
    public void recalculateTotal() {
        this.subtotal = items.stream()
                .map(OrderItem::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.total = this.subtotal
                .subtract(this.discount != null ? this.discount : BigDecimal.ZERO)
                .add(this.shippingCost != null ? this.shippingCost : BigDecimal.ZERO);
    }

    /**
     * Confirma o pagamento
     */
    public void confirmPayment() {
        if (this.status != OrderStatus.PENDING_PAYMENT) {
            throw new IllegalStateException("Pedido não está aguardando pagamento");
        }
        this.status = OrderStatus.PAID;
        this.paidAt = LocalDateTime.now();
    }

    /**
     * Envia o pedido
     */
    public void ship() {
        if (this.status != OrderStatus.PAID && this.status != OrderStatus.PROCESSING) {
            throw new IllegalStateException("Pedido não pode ser enviado no status atual");
        }
        this.status = OrderStatus.SHIPPED;
        this.shippedAt = LocalDateTime.now();
    }

    /**
     * Marca como entregue
     */
    public void deliver() {
        if (this.status != OrderStatus.SHIPPED) {
            throw new IllegalStateException("Pedido não foi enviado ainda");
        }
        this.status = OrderStatus.DELIVERED;
        this.deliveredAt = LocalDateTime.now();
    }

    /**
     * Cancela o pedido
     */
    public void cancel() {
        if (this.status == OrderStatus.DELIVERED) {
            throw new IllegalStateException("Pedido já foi entregue, não pode ser cancelado");
        }
        this.status = OrderStatus.CANCELLED;
        this.cancelledAt = LocalDateTime.now();
    }
}
