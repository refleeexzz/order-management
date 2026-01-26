package com.ordermanagement.dto.product;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductRequest {

    @NotBlank(message = "product name is required")
    @Size(max = 150, message = "name cannot exceed 150 characters")
    private String name;

    @Size(max = 1000, message = "description cannot exceed 1000 characters")
    private String description;

    @NotNull(message = "price is required")
    @DecimalMin(value = "0.01", message = "price must be greater than zero")
    private BigDecimal price;

    @NotNull(message = "stock quantity is required")
    @Min(value = 0, message = "stock quantity cannot be negative")
    private Integer stockQuantity;

    @Size(max = 50, message = "sku cannot exceed 50 characters")
    private String sku;

    @Size(max = 500, message = "image url cannot exceed 500 characters")
    private String imageUrl;

    @NotNull(message = "category id is required")
    private Long categoryId;
}
