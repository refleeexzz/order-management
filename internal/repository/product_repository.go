package repository

import (
	"github.com/refleeexzz/order-management/internal/domain"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// ProductRepository mirrors ProductRepository (Spring Data). Read queries
// always preload the Category association — ProductResponse flattens it
// into categoryId/categoryName.
type ProductRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

// WithTx returns a copy of the repository bound to the given transaction.
// Agents 3-4 (orders/payments): stock mutations must run inside an outer
// db.Transaction via this method + FindByIDForUpdate.
func (r *ProductRepository) WithTx(tx *gorm.DB) *ProductRepository {
	return &ProductRepository{db: tx}
}

// FindByID returns the product (with category), or gorm.ErrRecordNotFound.
func (r *ProductRepository) FindByID(id uint) (*domain.Product, error) {
	var product domain.Product
	if err := r.db.Preload("Category").First(&product, id).Error; err != nil {
		return nil, err
	}
	return &product, nil
}

// FindByIDForUpdate loads the product (with category) taking a row-level
// lock (SELECT ... FOR UPDATE). Call it through WithTx inside a transaction
// so the lock is held until commit — this is what order creation/cancel
// uses to serialize stock changes.
func (r *ProductRepository) FindByIDForUpdate(id uint) (*domain.Product, error) {
	var product domain.Product
	if err := r.db.Clauses(clause.Locking{Strength: "UPDATE"}).
		Preload("Category").First(&product, id).Error; err != nil {
		return nil, err
	}
	return &product, nil
}

// FindBySKU mirrors findBySku.
func (r *ProductRepository) FindBySKU(sku string) (*domain.Product, error) {
	var product domain.Product
	if err := r.db.Preload("Category").Where("sku = ?", sku).First(&product).Error; err != nil {
		return nil, err
	}
	return &product, nil
}

// ExistsBySKU mirrors existsBySku.
func (r *ProductRepository) ExistsBySKU(sku string) (bool, error) {
	var count int64
	if err := r.db.Model(&domain.Product{}).Where("sku = ?", sku).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// FindAllActive mirrors findByActiveTrue(pageable): active products only,
// sorted by name ASC (the controller hardcodes that sort), plus the total
// count for the page metadata.
func (r *ProductRepository) FindAllActive(page, size int) ([]domain.Product, int64, error) {
	var total int64
	if err := r.db.Model(&domain.Product{}).Where("active = true").Count(&total).Error; err != nil {
		return nil, 0, err
	}
	products := make([]domain.Product, 0)
	if err := r.db.Preload("Category").Where("active = true").
		Order("name ASC").Offset(page * size).Limit(size).Find(&products).Error; err != nil {
		return nil, 0, err
	}
	return products, total, nil
}

// FindByCategoryActive mirrors findByCategoryIdAndActiveTrue. Ordered by id
// for stable pagination (the Java endpoint uses an unsorted pageable —
// undefined order; see agent notes).
func (r *ProductRepository) FindByCategoryActive(categoryID uint, page, size int) ([]domain.Product, int64, error) {
	var total int64
	if err := r.db.Model(&domain.Product{}).
		Where("category_id = ? AND active = true", categoryID).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	products := make([]domain.Product, 0)
	if err := r.db.Preload("Category").
		Where("category_id = ? AND active = true", categoryID).
		Order("id ASC").Offset(page * size).Limit(size).Find(&products).Error; err != nil {
		return nil, 0, err
	}
	return products, total, nil
}

// SearchActive mirrors searchByName: active products whose name contains
// the term, case-insensitive (JPQL lower(name) like lower('%term%')).
// LOWER(...) LIKE LOWER(...) matches the JPQL semantics exactly.
func (r *ProductRepository) SearchActive(term string, page, size int) ([]domain.Product, int64, error) {
	pattern := "%" + term + "%"
	var total int64
	if err := r.db.Model(&domain.Product{}).
		Where("active = true AND lower(name) LIKE lower(?)", pattern).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	products := make([]domain.Product, 0)
	if err := r.db.Preload("Category").
		Where("active = true AND lower(name) LIKE lower(?)", pattern).
		Order("id ASC").Offset(page * size).Limit(size).Find(&products).Error; err != nil {
		return nil, 0, err
	}
	return products, total, nil
}

// FindLowStockActive mirrors findLowStockProducts: active products with
// stockQuantity <= threshold, unpaged.
func (r *ProductRepository) FindLowStockActive(threshold int) ([]domain.Product, error) {
	products := make([]domain.Product, 0)
	if err := r.db.Preload("Category").
		Where("active = true AND stock_quantity <= ?", threshold).Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

// Create persists a new product (id and created_at populated on return).
func (r *ProductRepository) Create(product *domain.Product) error {
	return r.db.Omit("Category").Create(product).Error
}

// Save updates every column of the product (struct-based → the BeforeUpdate
// hook refreshes updated_at, like Hibernate @UpdateTimestamp).
func (r *ProductRepository) Save(product *domain.Product) error {
	return r.db.Omit("Category").Save(product).Error
}
