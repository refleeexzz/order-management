package com.ordermanagement.dto.category;

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
public class CreateCategoryRequest {

    @NotBlank(message = "category name is required")
    @Size(max = 100, message = "name cannot exceed 100 characters")
    private String name;

    @Size(max = 500, message = "description cannot exceed 500 characters")
    private String description;
}
