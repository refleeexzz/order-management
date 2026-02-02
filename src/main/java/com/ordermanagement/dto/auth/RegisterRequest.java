package com.ordermanagement.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "name is required")
    @Size(min = 2, max = 100, message = "name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "email is required")
    @Email(message = "email must be valid")
    private String email;

    @NotBlank(message = "password is required")
    @Size(min = 6, max = 50, message = "password must be between 6 and 50 characters")
    private String password;

    private String role; // Optional: CUSTOMER, SELLER, ADMIN (defaults to CUSTOMER)
}
