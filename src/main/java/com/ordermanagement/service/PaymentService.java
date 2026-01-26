package com.ordermanagement.service;

import com.ordermanagement.domain.entity.Order;
import com.ordermanagement.domain.entity.Payment;
import com.ordermanagement.domain.enums.OrderStatus;
import com.ordermanagement.domain.enums.PaymentMethod;
import com.ordermanagement.domain.enums.PaymentStatus;
import com.ordermanagement.dto.payment.PaymentResponse;
import com.ordermanagement.dto.payment.ProcessPaymentRequest;
import com.ordermanagement.exception.BusinessException;
import com.ordermanagement.exception.ResourceNotFoundException;
import com.ordermanagement.repository.OrderRepository;
import com.ordermanagement.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public PaymentResponse processPayment(ProcessPaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", request.getOrderId()));

        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new BusinessException("order is not awaiting payment");
        }

        if (paymentRepository.findByOrderId(order.getId()).isPresent()) {
            throw new BusinessException("payment already exists for this order");
        }

        Payment payment = Payment.builder()
                .order(order)
                .method(request.getMethod())
                .status(PaymentStatus.PENDING)
                .amount(order.getTotal())
                .installments(request.getInstallments() != null ? request.getInstallments() : 1)
                .build();

        boolean paymentSuccessful = simulatePaymentProcessing(request);

        if (paymentSuccessful) {
            String transactionId = generateTransactionId(request.getMethod());
            payment.confirm(transactionId);
            order.confirmPayment();
            orderRepository.save(order);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }

        paymentRepository.save(payment);

        return PaymentResponse.fromEntity(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse findByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order: " + orderId));

        return PaymentResponse.fromEntity(payment);
    }

    @Transactional
    public PaymentResponse refund(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", paymentId));

        payment.refund();
        paymentRepository.save(payment);

        return PaymentResponse.fromEntity(payment);
    }

    private boolean simulatePaymentProcessing(ProcessPaymentRequest request) {
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        if (request.getMethod() == PaymentMethod.PIX || request.getMethod() == PaymentMethod.BANK_SLIP) {
            return true;
        }

        return request.getCardToken() != null && !request.getCardToken().isEmpty();
    }

    private String generateTransactionId(PaymentMethod method) {
        String prefix = switch (method) {
            case PIX -> "PIX";
            case CREDIT_CARD -> "CC";
            case DEBIT_CARD -> "DC";
            case BANK_SLIP -> "BOL";
            case BANK_TRANSFER -> "TED";
        };

        return prefix + "-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
    }
}
