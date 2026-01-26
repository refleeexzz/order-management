package com.ordermanagement.repository;

import com.ordermanagement.domain.entity.Order;
import com.ordermanagement.domain.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    Page<Order> findByCustomerId(Long customerId, Pageable pageable);

    List<Order> findByStatus(OrderStatus status);

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    @Query("select o from Order o left join fetch o.items where o.id = :id")
    Optional<Order> findByIdWithItems(Long id);

    @Query("select o from Order o left join fetch o.items left join fetch o.customer where o.orderNumber = :orderNumber")
    Optional<Order> findByOrderNumberWithDetails(String orderNumber);

    @Query("select o from Order o where o.createdAt between :startDate and :endDate")
    List<Order> findOrdersBetweenDates(LocalDateTime startDate, LocalDateTime endDate);

    long countByStatus(OrderStatus status);

    @Query("select o from Order o where o.customer.id = :customerId order by o.createdAt desc")
    List<Order> findRecentOrdersByCustomer(Long customerId, Pageable pageable);
}
