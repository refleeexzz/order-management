package com.ordermanagement.repository;

import com.ordermanagement.domain.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByUserId(Long userId);

    Optional<Customer> findByCpf(String cpf);

    boolean existsByCpf(String cpf);

    @Query("select c from Customer c left join fetch c.orders where c.id = :id")
    Optional<Customer> findByIdWithOrders(Long id);
}
