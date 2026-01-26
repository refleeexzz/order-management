package com.ordermanagement.controller;

import com.ordermanagement.domain.enums.OrderStatus;
import com.ordermanagement.dto.common.PageResponse;
import com.ordermanagement.dto.order.CreateOrderRequest;
import com.ordermanagement.dto.order.OrderResponse;
import com.ordermanagement.dto.order.UpdateOrderStatusRequest;
import com.ordermanagement.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "order management endpoints")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "create a new order", description = "creates a new order for the current customer")
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse response = orderService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "get order by id", description = "retrieves a specific order by its id")
    public ResponseEntity<OrderResponse> findById(@PathVariable Long id) {
        OrderResponse response = orderService.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/number/{orderNumber}")
    @Operation(summary = "get order by number", description = "retrieves a specific order by its order number")
    public ResponseEntity<OrderResponse> findByOrderNumber(@PathVariable String orderNumber) {
        OrderResponse response = orderService.findByOrderNumber(orderNumber);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-orders")
    @Operation(summary = "list my orders", description = "retrieves all orders for the current customer")
    public ResponseEntity<PageResponse<OrderResponse>> findMyOrders(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<OrderResponse> response = orderService.findMyOrders(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "list all orders", description = "retrieves all orders (admin only)")
    public ResponseEntity<PageResponse<OrderResponse>> findAll(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<OrderResponse> response = orderService.findAll(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "list orders by status", description = "retrieves orders filtered by status")
    public ResponseEntity<PageResponse<OrderResponse>> findByStatus(
            @PathVariable OrderStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<OrderResponse> response = orderService.findByStatus(status, pageable);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "update order status", description = "updates the status of an order")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderResponse response = orderService.updateStatus(id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "cancel order", description = "cancels an order and returns stock")
    public ResponseEntity<OrderResponse> cancel(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        OrderResponse response = orderService.cancel(id, reason);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "get order statistics", description = "retrieves order count by status")
    public ResponseEntity<OrderService.OrderStats> getStats() {
        OrderService.OrderStats stats = orderService.getOrderStats();
        return ResponseEntity.ok(stats);
    }
}
