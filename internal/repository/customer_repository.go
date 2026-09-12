package repository

import (
	"github.com/refleeexzz/order-management/internal/domain"
	"gorm.io/gorm"
)

// CustomerRepository mirrors CustomerRepository (Spring Data). Reads always
// preload the User association — CustomerResponse flattens it into
// name/email.
type CustomerRepository struct {
	db *gorm.DB
}

func NewCustomerRepository(db *gorm.DB) *CustomerRepository {
	return &CustomerRepository{db: db}
}

// WithTx returns a copy of the repository bound to the given transaction.
func (r *CustomerRepository) WithTx(tx *gorm.DB) *CustomerRepository {
	return &CustomerRepository{db: tx}
}

// FindByUserID mirrors findByUserId (user preloaded).
func (r *CustomerRepository) FindByUserID(userID uint) (*domain.Customer, error) {
	var customer domain.Customer
	if err := r.db.Preload("User").Where("user_id = ?", userID).First(&customer).Error; err != nil {
		return nil, err
	}
	return &customer, nil
}

// FindByID mirrors findById (user preloaded).
func (r *CustomerRepository) FindByID(id uint) (*domain.Customer, error) {
	var customer domain.Customer
	if err := r.db.Preload("User").First(&customer, id).Error; err != nil {
		return nil, err
	}
	return &customer, nil
}

// ExistsByCPF mirrors existsByCpf.
func (r *CustomerRepository) ExistsByCPF(cpf string) (bool, error) {
	var count int64
	if err := r.db.Model(&domain.Customer{}).Where("cpf = ?", cpf).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// FindAll mirrors findAll(pageable) with the controller's hardcoded sort
// id DESC. Returns the page content (user preloaded) plus the total count.
func (r *CustomerRepository) FindAll(page, size int) ([]domain.Customer, int64, error) {
	var total int64
	if err := r.db.Model(&domain.Customer{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	customers := make([]domain.Customer, 0)
	if err := r.db.Preload("User").Order("id DESC").
		Offset(page * size).Limit(size).Find(&customers).Error; err != nil {
		return nil, 0, err
	}
	return customers, total, nil
}

// CountOrdersByCustomerIDs returns how many orders each given customer has
// (CustomerResponse.totalOrders — the size of the JPA orders collection).
func (r *CustomerRepository) CountOrdersByCustomerIDs(ids []uint) (map[uint]int64, error) {
	counts := make(map[uint]int64, len(ids))
	if len(ids) == 0 {
		return counts, nil
	}
	var rows []struct {
		CustomerID uint
		Count      int64
	}
	if err := r.db.Model(&domain.Order{}).Select("customer_id, count(*) as count").
		Where("customer_id IN ?", ids).Group("customer_id").Scan(&rows).Error; err != nil {
		return nil, err
	}
	for _, row := range rows {
		counts[row.CustomerID] = row.Count
	}
	return counts, nil
}

// Create persists a new customer (associations are never cascaded — the
// user already exists and orders stay empty).
func (r *CustomerRepository) Create(customer *domain.Customer) error {
	return r.db.Omit("User", "Orders").Create(customer).Error
}

// Save updates every column of the customer (struct-based → BeforeUpdate
// hook refreshes updated_at, like Hibernate @UpdateTimestamp).
func (r *CustomerRepository) Save(customer *domain.Customer) error {
	return r.db.Omit("User", "Orders").Save(customer).Error
}
