package com.ordermanagement.service;

import com.ordermanagement.domain.entity.*;
import com.ordermanagement.domain.enums.OrderStatus;
import com.ordermanagement.dto.common.PageResponse;
import com.ordermanagement.dto.order.*;
import com.ordermanagement.exception.BusinessException;
import com.ordermanagement.exception.ResourceNotFoundException;
import com.ordermanagement.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductService productService;
    private final CustomerService customerService;

    @Transactional
    public OrderResponse create(CreateOrderRequest request) {
        Customer customer = customerService.getCurrentCustomerEntity();
        String orderNumber = generateOrderNumber();

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .customer(customer)
                .status(OrderStatus.PENDING_PAYMENT)
                .subtotal(BigDecimal.ZERO)
                .discount(BigDecimal.ZERO)
                .shippingCost(calculateShippingCost(request))
                .total(BigDecimal.ZERO)
                .notes(request.getNotes())
                .build();

        if (request.getShippingAddress() != null) {
            order.setShippingAddress(request.getShippingAddress().toEntity());
        } else if (customer.getAddress() != null) {
            order.setShippingAddress(customer.getAddress());
        }

        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productService.getEntityById(itemRequest.getProductId());

            if (!product.hasStock(itemRequest.getQuantity())) {
                throw new BusinessException(
                        String.format("insufficient stock for product '%s'. available: %d, requested: %d",
                                product.getName(), product.getStockQuantity(), itemRequest.getQuantity())
                );
            }

            OrderItem item = OrderItem.builder()
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(product.getPrice())
                    .total(product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())))
                    .build();

            order.addItem(item);
            productService.decreaseStock(product.getId(), itemRequest.getQuantity());
        }

        if (request.getCouponCode() != null) {
            BigDecimal discount = applyCoupon(request.getCouponCode(), order.getSubtotal());
            order.setDiscount(discount);
            order.recalculateTotal();
        }

        orderRepository.save(order);

        return OrderResponse.fromEntity(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse findById(Long id) {
        Order order = orderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        validateOrderAccess(order);

        return OrderResponse.fromEntity(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse findByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumberWithDetails(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderNumber", orderNumber));

        validateOrderAccess(order);

        return OrderResponse.fromEntity(order);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> findMyOrders(Pageable pageable) {
        Customer customer = customerService.getCurrentCustomerEntity();

        Page<OrderResponse> page = orderRepository.findByCustomerId(customer.getId(), pageable)
                .map(order -> {
                    return orderRepository.findByIdWithItems(order.getId())
                            .map(OrderResponse::fromEntity)
                            .orElse(null);
                });

        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> findAll(Pageable pageable) {
        Page<OrderResponse> page = orderRepository.findAll(pageable)
                .map(OrderResponse::fromEntity);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> findByStatus(OrderStatus status, Pageable pageable) {
        Page<OrderResponse> page = orderRepository.findByStatus(status, pageable)
                .map(OrderResponse::fromEntity);
        return PageResponse.from(page);
    }

    @Transactional
    public OrderResponse updateStatus(Long id, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        OrderStatus newStatus = request.getStatus();

        switch (newStatus) {
            case PAID -> order.confirmPayment();
            case PROCESSING -> {
                if (order.getStatus() != OrderStatus.PAID) {
                    throw new BusinessException("order must be paid before processing");
                }
                order.setStatus(OrderStatus.PROCESSING);
            }
            case SHIPPED -> order.ship();
            case DELIVERED -> order.deliver();
            case CANCELLED -> {
                for (OrderItem item : order.getItems()) {
                    productService.increaseStock(item.getProduct().getId(), item.getQuantity());
                }
                order.cancel();
            }
            default -> throw new BusinessException("invalid status transition");
        }

        orderRepository.save(order);

        return OrderResponse.fromEntity(order);
    }

    @Transactional
    public OrderResponse cancel(Long id, String reason) {
        Order order = orderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        validateOrderAccess(order);

        for (OrderItem item : order.getItems()) {
            productService.increaseStock(item.getProduct().getId(), item.getQuantity());
        }

        order.cancel();
        order.setNotes(order.getNotes() != null ? order.getNotes() + " | cancelled: " + reason : "cancelled: " + reason);

        orderRepository.save(order);

        return OrderResponse.fromEntity(order);
    }

    @Transactional(readOnly = true)
    public OrderStats getOrderStats() {
        return OrderStats.builder()
                .pendingPayment(orderRepository.countByStatus(OrderStatus.PENDING_PAYMENT))
                .paid(orderRepository.countByStatus(OrderStatus.PAID))
                .processing(orderRepository.countByStatus(OrderStatus.PROCESSING))
                .shipped(orderRepository.countByStatus(OrderStatus.SHIPPED))
                .delivered(orderRepository.countByStatus(OrderStatus.DELIVERED))
                .cancelled(orderRepository.countByStatus(OrderStatus.CANCELLED))
                .build();
    }

    private String generateOrderNumber() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uniquePart = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        return "ORD-" + datePart + "-" + uniquePart;
    }

    private BigDecimal calculateShippingCost(CreateOrderRequest request) {
        return new BigDecimal("15.00");
    }

    private BigDecimal applyCoupon(String couponCode, BigDecimal subtotal) {
        if ("FIRST10".equalsIgnoreCase(couponCode)) {
            return subtotal.multiply(new BigDecimal("0.10"));
        }
        return BigDecimal.ZERO;
    }

    private void validateOrderAccess(Order order) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (currentUser.getRole().name().equals("ADMIN") || currentUser.getRole().name().equals("MANAGER")) {
            return;
        }

        if (!order.getCustomer().getUser().getId().equals(currentUser.getId())) {
            throw new BusinessException("you don't have permission to access this order");
        }
    }

    @lombok.Data
    @lombok.Builder
    public static class OrderStats {
        private long pendingPayment;
        private long paid;
        private long processing;
        private long shipped;
        private long delivered;
        private long cancelled;
    }
}
