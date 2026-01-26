package com.ordermanagement.repository;

import com.ordermanagement.domain.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByActiveTrue(Pageable pageable);

    Page<Product> findByCategoryIdAndActiveTrue(Long categoryId, Pageable pageable);

    Optional<Product> findBySku(String sku);

    @Query("select p from Product p where p.active = true and lower(p.name) like lower(concat('%', :searchTerm, '%'))")
    Page<Product> searchByName(String searchTerm, Pageable pageable);

    @Query("select p from Product p where p.active = true and p.stockQuantity <= :threshold")
    List<Product> findLowStockProducts(int threshold);

    boolean existsBySku(String sku);
}
