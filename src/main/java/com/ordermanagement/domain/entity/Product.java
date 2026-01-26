package com.ordermanagement.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Entidade Produto
 */
@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    @Column(unique = true, length = 50)
    private String sku;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(nullable = false)
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    /**
     * Verifica se há estoque disponível
     */
    public boolean hasStock(int quantity) {
        return this.stockQuantity >= quantity;
    }

    /**
     * Reduz o estoque
     */
    public void decreaseStock(int quantity) {
        if (!hasStock(quantity)) {
            throw new IllegalStateException("Estoque insuficiente para o produto: " + name);
        }
        this.stockQuantity -= quantity;
    }

    /**
     * Aumenta o estoque
     */
    public void increaseStock(int quantity) {
        this.stockQuantity += quantity;
    }
}
