package service

import (
	"errors"

	"github.com/refleeexzz/order-management/internal/apperror"
	"github.com/refleeexzz/order-management/internal/domain"
	"github.com/refleeexzz/order-management/internal/dto"
	"github.com/refleeexzz/order-management/internal/repository"
	"gorm.io/gorm"
)

// ProductService mirrors service/ProductService.
type ProductService struct {
	db         *gorm.DB
	products   *repository.ProductRepository
	categories *CategoryService
}

func NewProductService(db *gorm.DB, products *repository.ProductRepository, categories *CategoryService) *ProductService {
	return &ProductService{db: db, products: products, categories: categories}
}

// Create mirrors ProductService.create: a non-null sku that already exists
// → 409; the category must exist → 404; the new product is active=true.
func (s *ProductService) Create(req dto.CreateProductRequest) (*dto.ProductResponse, error) {
	if req.SKU != nil {
		exists, err := s.products.ExistsBySKU(*req.SKU)
		if err != nil {
			return nil, err
		}
		if exists {
			return nil, apperror.Duplicate("Product", "sku", *req.SKU)
		}
	}

	category, err := s.categories.GetEntityByID(*req.CategoryID)
	if err != nil {
		return nil, err
	}

	product := &domain.Product{
		Name:          req.Name,
		Description:   req.Description,
		Price:         *req.Price,
		StockQuantity: *req.StockQuantity,
		SKU:           req.SKU,
		ImageURL:      req.ImageURL,
		CategoryID:    category.ID,
		Active:        true,
	}
	if err := s.products.Create(product); err != nil {
		return nil, err
	}
	product.Category = *category
	return dto.NewProductResponse(product), nil
}

// FindByID mirrors ProductService.findById → 404 "Product not found with id: <id>".
func (s *ProductService) FindByID(id uint) (*dto.ProductResponse, error) {
	product, err := s.GetEntityByID(id)
	if err != nil {
		return nil, err
	}
	return dto.NewProductResponse(product), nil
}

// FindBySKU mirrors ProductService.findBySku → 404 "Product not found with sku: <sku>".
func (s *ProductService) FindBySKU(sku string) (*dto.ProductResponse, error) {
	product, err := s.products.FindBySKU(sku)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apperror.NotFoundByField("Product", "sku", sku)
	}
	if err != nil {
		return nil, err
	}
	return dto.NewProductResponse(product), nil
}

// FindAllActive mirrors ProductService.findAllActive (active only, paged).
func (s *ProductService) FindAllActive(page, size int) (*dto.PageResponse[dto.ProductResponse], error) {
	products, total, err := s.products.FindAllActive(page, size)
	if err != nil {
		return nil, err
	}
	resp := dto.NewPageResponse(toProductResponses(products), page, size, total)
	return &resp, nil
}

// FindByCategory mirrors ProductService.findByCategory (active + category, paged).
func (s *ProductService) FindByCategory(categoryID uint, page, size int) (*dto.PageResponse[dto.ProductResponse], error) {
	products, total, err := s.products.FindByCategoryActive(categoryID, page, size)
	if err != nil {
		return nil, err
	}
	resp := dto.NewPageResponse(toProductResponses(products), page, size, total)
	return &resp, nil
}

// Search mirrors ProductService.search (active, name LIKE, paged).
func (s *ProductService) Search(term string, page, size int) (*dto.PageResponse[dto.ProductResponse], error) {
	products, total, err := s.products.SearchActive(term, page, size)
	if err != nil {
		return nil, err
	}
	resp := dto.NewPageResponse(toProductResponses(products), page, size, total)
	return &resp, nil
}

// FindLowStock mirrors ProductService.findLowStockProducts (unpaged list).
func (s *ProductService) FindLowStock(threshold int) ([]dto.ProductResponse, error) {
	products, err := s.products.FindLowStockActive(threshold)
	if err != nil {
		return nil, err
	}
	return toProductResponses(products), nil
}

// Update mirrors ProductService.update: PARTIAL update — only non-null
// request fields are applied; a categoryId change validates that the
// category exists (404).
func (s *ProductService) Update(id uint, req dto.UpdateProductRequest) (*dto.ProductResponse, error) {
	product, err := s.GetEntityByID(id)
	if err != nil {
		return nil, err
	}

	if req.CategoryID != nil {
		category, err := s.categories.GetEntityByID(*req.CategoryID)
		if err != nil {
			return nil, err
		}
		product.Category = *category
	}
	ApplyProductUpdate(product, req)

	if err := s.products.Save(product); err != nil {
		return nil, err
	}
	return dto.NewProductResponse(product), nil
}

// Deactivate mirrors ProductService.deactivate: soft delete (active=false).
func (s *ProductService) Deactivate(id uint) error {
	product, err := s.GetEntityByID(id)
	if err != nil {
		return err
	}
	product.Active = false
	return s.products.Save(product)
}

// GetEntityByID mirrors ProductService.getEntityById.
func (s *ProductService) GetEntityByID(id uint) (*domain.Product, error) {
	product, err := s.products.FindByID(id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apperror.NotFound("Product", int64(id))
	}
	if err != nil {
		return nil, err
	}
	return product, nil
}

// DecreaseStock mirrors ProductService.decreaseStock: insufficient stock →
// 409 InsufficientStockException, else subtract + save. Runs in a
// transaction with a row lock (SELECT ... FOR UPDATE) so concurrent
// decrements serialize — orders (agent 3) call this behavior via
// DecreaseStockInTx when they already hold an outer transaction.
func (s *ProductService) DecreaseStock(productID uint, quantity int) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		return s.DecreaseStockInTx(tx, productID, quantity)
	})
}

// DecreaseStockInTx is the transactional variant of DecreaseStock for
// callers that already run inside db.Transaction (agent 3's order creation
// decrements stock for all items in ONE transaction).
func (s *ProductService) DecreaseStockInTx(tx *gorm.DB, productID uint, quantity int) error {
	repo := s.products.WithTx(tx)
	product, err := repo.FindByIDForUpdate(productID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return apperror.NotFound("Product", int64(productID))
	}
	if err != nil {
		return err
	}
	if !product.HasStock(quantity) {
		return apperror.InsufficientStock(int64(productID), quantity, product.StockQuantity)
	}
	// Cannot fail after the HasStock check above (Java calls the entity
	// method the same way).
	_ = product.DecreaseStock(quantity)
	return repo.Save(product)
}

// IncreaseStock mirrors ProductService.increaseStock: add + save, with the
// same row-locking discipline (order cancellation restores stock).
func (s *ProductService) IncreaseStock(productID uint, quantity int) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		return s.IncreaseStockInTx(tx, productID, quantity)
	})
}

// IncreaseStockInTx is the transactional variant of IncreaseStock.
func (s *ProductService) IncreaseStockInTx(tx *gorm.DB, productID uint, quantity int) error {
	repo := s.products.WithTx(tx)
	product, err := repo.FindByIDForUpdate(productID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return apperror.NotFound("Product", int64(productID))
	}
	if err != nil {
		return err
	}
	product.IncreaseStock(quantity)
	return repo.Save(product)
}

// ApplyProductUpdate mirrors the field-by-field partial update in
// ProductService.update: only non-null request fields are applied to the
// entity. The category association is handled by the caller (it needs a
// repository lookup); here only the FK is switched when CategoryID is set
// and the caller already validated+loaded the new category.
func ApplyProductUpdate(product *domain.Product, req dto.UpdateProductRequest) {
	if req.Name != nil {
		product.Name = *req.Name
	}
	if req.Description != nil {
		product.Description = *req.Description
	}
	if req.Price != nil {
		product.Price = *req.Price
	}
	if req.StockQuantity != nil {
		product.StockQuantity = *req.StockQuantity
	}
	if req.ImageURL != nil {
		product.ImageURL = *req.ImageURL
	}
	if req.CategoryID != nil {
		product.CategoryID = *req.CategoryID
	}
	if req.Active != nil {
		product.Active = *req.Active
	}
}

func toProductResponses(products []domain.Product) []dto.ProductResponse {
	responses := make([]dto.ProductResponse, 0, len(products))
	for i := range products {
		responses = append(responses, *dto.NewProductResponse(&products[i]))
	}
	return responses
}
