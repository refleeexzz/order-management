package com.ordermanagement.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductRequest {

    @Size(max = 150, message = "name cannot exceed 150 characters")
    private String name;

    @Size(max = 1000, message = "description cannot exceed 1000 characters")
    private String description;

    @DecimalMin(value = "0.01", message = "price must be greater than zero")
    private BigDecimal price;

    @Min(value = 0, message = "stock quantity cannot be negative")
    private Integer stockQuantity;

    @Size(max = 500, message = "image url cannot exceed 500 characters")
    private String imageUrl;

    private Long categoryId;

    private Boolean active;
}
