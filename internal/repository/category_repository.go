package repository

import (
	"github.com/refleeexzz/order-management/internal/domain"
	"gorm.io/gorm"
)

// CategoryRepository mirrors CategoryRepository (Spring Data).
type CategoryRepository struct {
	db *gorm.DB
}

func NewCategoryRepository(db *gorm.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
}

// WithTx returns a copy of the repository bound to the given transaction
// (agents 3-4: use this to join an outer db.Transaction).
func (r *CategoryRepository) WithTx(tx *gorm.DB) *CategoryRepository {
	return &CategoryRepository{db: tx}
}

// ExistsByName mirrors existsByName (case-sensitive, like the JPQL derived
// query on a case-sensitive collation).
func (r *CategoryRepository) ExistsByName(name string) (bool, error) {
	var count int64
	if err := r.db.Model(&domain.Category{}).Where("name = ?", name).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// FindByID returns the category with the given id, or
// gorm.ErrRecordNotFound when absent.
func (r *CategoryRepository) FindByID(id uint) (*domain.Category, error) {
	var category domain.Category
	if err := r.db.First(&category, id).Error; err != nil {
		return nil, err
	}
	return &category, nil
}

// FindAllActive mirrors findByActiveTrue.
func (r *CategoryRepository) FindAllActive() ([]domain.Category, error) {
	categories := make([]domain.Category, 0)
	if err := r.db.Where("active = true").Find(&categories).Error; err != nil {
		return nil, err
	}
	return categories, nil
}

// FindAll mirrors findAll (includes inactive categories).
func (r *CategoryRepository) FindAll() ([]domain.Category, error) {
	categories := make([]domain.Category, 0)
	if err := r.db.Find(&categories).Error; err != nil {
		return nil, err
	}
	return categories, nil
}

// Create persists a new category (id and created_at populated on return).
func (r *CategoryRepository) Create(category *domain.Category) error {
	return r.db.Omit("Products").Create(category).Error
}

// Save updates every column of the category (struct-based, so the
// BaseModel BeforeUpdate hook refreshes updated_at — Hibernate
// @UpdateTimestamp parity).
func (r *CategoryRepository) Save(category *domain.Category) error {
	return r.db.Omit("Products").Save(category).Error
}

// CountProducts counts ALL products of the category (including inactive),
// matching CategoryResponse.fromEntity's category.getProducts().size().
func (r *CategoryRepository) CountProducts(categoryID uint) (int64, error) {
	var count int64
	if err := r.db.Model(&domain.Product{}).Where("category_id = ?", categoryID).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}
