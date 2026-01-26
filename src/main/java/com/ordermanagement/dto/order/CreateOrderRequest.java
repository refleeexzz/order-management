package com.ordermanagement.dto.order;

import com.ordermanagement.dto.customer.AddressDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    @NotEmpty(message = "order must have at least one item")
    @Valid
    private List<OrderItemRequest> items;

    @Valid
    private AddressDto shippingAddress;

    private String notes;

    private String couponCode;
}
