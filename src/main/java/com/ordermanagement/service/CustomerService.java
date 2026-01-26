package com.ordermanagement.service;

import com.ordermanagement.domain.entity.Customer;
import com.ordermanagement.domain.entity.User;
import com.ordermanagement.dto.customer.CreateCustomerRequest;
import com.ordermanagement.dto.customer.CustomerResponse;
import com.ordermanagement.exception.DuplicateResourceException;
import com.ordermanagement.exception.ResourceNotFoundException;
import com.ordermanagement.repository.CustomerRepository;
import com.ordermanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<CustomerResponse> findAll(Pageable pageable) {
        return customerRepository.findAll(pageable)
                .map(CustomerResponse::fromEntity);
    }

    @Transactional
    public CustomerResponse createForCurrentUser(CreateCustomerRequest request) {
        User currentUser = getCurrentUser();

        if (customerRepository.findByUserId(currentUser.getId()).isPresent()) {
            throw new DuplicateResourceException("Customer profile already exists for this user");
        }

        if (customerRepository.existsByCpf(request.getCpf())) {
            throw new DuplicateResourceException("Customer", "cpf", request.getCpf());
        }

        Customer customer = Customer.builder()
                .user(currentUser)
                .cpf(request.getCpf())
                .phone(request.getPhone())
                .address(request.getAddress() != null ? request.getAddress().toEntity() : null)
                .build();

        customerRepository.save(customer);

        return CustomerResponse.fromEntity(customer);
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCurrentCustomer() {
        User currentUser = getCurrentUser();

        Customer customer = customerRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found for current user"));

        return CustomerResponse.fromEntity(customer);
    }

    @Transactional(readOnly = true)
    public CustomerResponse findById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));

        return CustomerResponse.fromEntity(customer);
    }

    @Transactional
    public CustomerResponse updateCurrentCustomer(CreateCustomerRequest request) {
        User currentUser = getCurrentUser();

        Customer customer = customerRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found for current user"));

        customer.setPhone(request.getPhone());
        if (request.getAddress() != null) {
            customer.setAddress(request.getAddress().toEntity());
        }

        customerRepository.save(customer);

        return CustomerResponse.fromEntity(customer);
    }

    @Transactional(readOnly = true)
    public Customer getCurrentCustomerEntity() {
        User currentUser = getCurrentUser();

        return customerRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found. Please create one first."));
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
