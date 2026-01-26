package com.ordermanagement.controller;

import com.ordermanagement.dto.customer.CreateCustomerRequest;
import com.ordermanagement.dto.customer.CustomerResponse;
import com.ordermanagement.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@Tag(name = "Customers", description = "customer profile management endpoints")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "list all customers", description = "retrieves all customers with pagination (admin only)")
    public ResponseEntity<Page<CustomerResponse>> findAll(
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<CustomerResponse> response = customerService.findAll(pageable);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "create customer profile", description = "creates a customer profile for the current user")
    public ResponseEntity<CustomerResponse> create(@Valid @RequestBody CreateCustomerRequest request) {
        CustomerResponse response = customerService.createForCurrentUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    @Operation(summary = "get my profile", description = "retrieves the customer profile of the current user")
    public ResponseEntity<CustomerResponse> getMyProfile() {
        CustomerResponse response = customerService.getCurrentCustomer();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    @Operation(summary = "update my profile", description = "updates the customer profile of the current user")
    public ResponseEntity<CustomerResponse> updateMyProfile(@Valid @RequestBody CreateCustomerRequest request) {
        CustomerResponse response = customerService.updateCurrentCustomer(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "get customer by id", description = "retrieves a specific customer by id (admin only)")
    public ResponseEntity<CustomerResponse> findById(@PathVariable Long id) {
        CustomerResponse response = customerService.findById(id);
        return ResponseEntity.ok(response);
    }
}
