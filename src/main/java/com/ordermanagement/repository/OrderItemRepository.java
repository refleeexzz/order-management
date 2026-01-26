package com.ordermanagement.repository;

import com.ordermanagement.domain.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    List<OrderItem> findByProductId(Long productId);

    @Query("select coalesce(sum(oi.quantity), 0) from OrderItem oi where oi.product.id = :productId")
    int getTotalQuantitySoldByProduct(Long productId);
}
