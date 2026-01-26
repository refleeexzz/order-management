package com.ordermanagement.controller;

import com.ordermanagement.dto.payment.PaymentResponse;
import com.ordermanagement.dto.payment.ProcessPaymentRequest;
import com.ordermanagement.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "payment processing endpoints")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @Operation(summary = "process payment", description = "processes a payment for an order")
    public ResponseEntity<PaymentResponse> processPayment(@Valid @RequestBody ProcessPaymentRequest request) {
        PaymentResponse response = paymentService.processPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "get payment by order", description = "retrieves payment information for an order")
    public ResponseEntity<PaymentResponse> findByOrderId(@PathVariable Long orderId) {
        PaymentResponse response = paymentService.findByOrderId(orderId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{paymentId}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "refund payment", description = "processes a refund for a payment (admin only)")
    public ResponseEntity<PaymentResponse> refund(@PathVariable Long paymentId) {
        PaymentResponse response = paymentService.refund(paymentId);
        return ResponseEntity.ok(response);
    }
}
