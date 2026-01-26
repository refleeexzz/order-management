package com.ordermanagement.dto.customer;

import com.ordermanagement.domain.entity.Customer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {

    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String cpf;
    private String phone;
    private AddressDto address;
    private int totalOrders;
    private LocalDateTime createdAt;

    public static CustomerResponse fromEntity(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .userId(customer.getUser().getId())
                .name(customer.getUser().getName())
                .email(customer.getUser().getEmail())
                .cpf(customer.getCpf())
                .phone(customer.getPhone())
                .address(AddressDto.fromEntity(customer.getAddress()))
                .totalOrders(customer.getOrders() != null ? customer.getOrders().size() : 0)
                .createdAt(customer.getCreatedAt())
                .build();
    }
}
