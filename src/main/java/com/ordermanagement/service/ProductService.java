package com.ordermanagement.service;

import com.ordermanagement.domain.entity.Category;
import com.ordermanagement.domain.entity.Product;
import com.ordermanagement.dto.common.PageResponse;
import com.ordermanagement.dto.product.CreateProductRequest;
import com.ordermanagement.dto.product.ProductResponse;
import com.ordermanagement.dto.product.UpdateProductRequest;
import com.ordermanagement.exception.DuplicateResourceException;
import com.ordermanagement.exception.InsufficientStockException;
import com.ordermanagement.exception.ResourceNotFoundException;
import com.ordermanagement.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryService categoryService;

    @Transactional
    public ProductResponse create(CreateProductRequest request) {
        if (request.getSku() != null && productRepository.existsBySku(request.getSku())) {
            throw new DuplicateResourceException("Product", "sku", request.getSku());
        }

        Category category = categoryService.getEntityById(request.getCategoryId());

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .sku(request.getSku())
                .imageUrl(request.getImageUrl())
                .category(category)
                .active(true)
                .build();

        productRepository.save(product);

        return ProductResponse.fromEntity(product);
    }

    @Transactional(readOnly = true)
    public ProductResponse findById(Long id) {
        Product product = getEntityById(id);
        return ProductResponse.fromEntity(product);
    }

    @Transactional(readOnly = true)
    public ProductResponse findBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "sku", sku));
        return ProductResponse.fromEntity(product);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> findAllActive(Pageable pageable) {
        Page<ProductResponse> page = productRepository.findByActiveTrue(pageable)
                .map(ProductResponse::fromEntity);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> findByCategory(Long categoryId, Pageable pageable) {
        Page<ProductResponse> page = productRepository.findByCategoryIdAndActiveTrue(categoryId, pageable)
                .map(ProductResponse::fromEntity);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> search(String searchTerm, Pageable pageable) {
        Page<ProductResponse> page = productRepository.searchByName(searchTerm, pageable)
                .map(ProductResponse::fromEntity);
        return PageResponse.from(page);
    }

    @Transactional
    public ProductResponse update(Long id, UpdateProductRequest request) {
        Product product = getEntityById(id);

        if (request.getName() != null) {
            product.setName(request.getName());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        if (request.getStockQuantity() != null) {
            product.setStockQuantity(request.getStockQuantity());
        }
        if (request.getImageUrl() != null) {
            product.setImageUrl(request.getImageUrl());
        }
        if (request.getCategoryId() != null) {
            Category category = categoryService.getEntityById(request.getCategoryId());
            product.setCategory(category);
        }
        if (request.getActive() != null) {
            product.setActive(request.getActive());
        }

        productRepository.save(product);

        return ProductResponse.fromEntity(product);
    }

    @Transactional
    public void deactivate(Long id) {
        Product product = getEntityById(id);
        product.setActive(false);
        productRepository.save(product);
    }

    @Transactional
    public void decreaseStock(Long productId, int quantity) {
        Product product = getEntityById(productId);

        if (!product.hasStock(quantity)) {
            throw new InsufficientStockException(productId, quantity, product.getStockQuantity());
        }

        product.decreaseStock(quantity);
        productRepository.save(product);
    }

    @Transactional
    public void increaseStock(Long productId, int quantity) {
        Product product = getEntityById(productId);
        product.increaseStock(quantity);
        productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> findLowStockProducts(int threshold) {
        return productRepository.findLowStockProducts(threshold).stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Product getEntityById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }
}
