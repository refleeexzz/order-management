package com.ordermanagement.controller;

import com.ordermanagement.dto.common.PageResponse;
import com.ordermanagement.dto.product.CreateProductRequest;
import com.ordermanagement.dto.product.ProductResponse;
import com.ordermanagement.dto.product.UpdateProductRequest;
import com.ordermanagement.service.ProductService;
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

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "product catalog management endpoints")
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "create a new product", description = "creates a new product in the catalog")
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody CreateProductRequest request) {
        ProductResponse response = productService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "get product by id", description = "retrieves a specific product by its id")
    public ResponseEntity<ProductResponse> findById(@PathVariable Long id) {
        ProductResponse response = productService.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sku/{sku}")
    @Operation(summary = "get product by sku", description = "retrieves a specific product by its sku code")
    public ResponseEntity<ProductResponse> findBySku(@PathVariable String sku) {
        ProductResponse response = productService.findBySku(sku);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "list all products", description = "retrieves all active products with pagination")
    public ResponseEntity<PageResponse<ProductResponse>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, Sort.by("name").ascending());
        PageResponse<ProductResponse> response = productService.findAllActive(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "list products by category", description = "retrieves products filtered by category")
    public ResponseEntity<PageResponse<ProductResponse>> findByCategory(
            @PathVariable Long categoryId,
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<ProductResponse> response = productService.findByCategory(categoryId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    @Operation(summary = "search products", description = "searches products by name")
    public ResponseEntity<PageResponse<ProductResponse>> search(
            @RequestParam String query,
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<ProductResponse> response = productService.search(query, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "list low stock products", description = "retrieves products with stock below threshold")
    public ResponseEntity<List<ProductResponse>> findLowStock(
            @RequestParam(defaultValue = "10") int threshold) {
        List<ProductResponse> response = productService.findLowStockProducts(threshold);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "update a product", description = "updates an existing product")
    public ResponseEntity<ProductResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductRequest request) {
        ProductResponse response = productService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "deactivate a product", description = "soft deletes a product by marking it inactive")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
