package com.ordermanagement.dto.payment;

import com.ordermanagement.domain.enums.PaymentMethod;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessPaymentRequest {

    @NotNull(message = "order id is required")
    private Long orderId;

    @NotNull(message = "payment method is required")
    private PaymentMethod method;

    @Min(value = 1, message = "installments must be at least 1")
    private Integer installments = 1;

    // for credit card payments - in a real app this would be tokenized
    private String cardToken;
}
