package repository

import (
	"github.com/refleeexzz/order-management/internal/domain"
	"gorm.io/gorm"
)

// OrderRepository mirrors OrderRepository (Spring Data). Detail reads
// preload Items (+ each item's Product) and Customer (+ its User) —
// everything OrderResponse needs (the Java service lazy-loads the same
// associations inside its read-only transaction).
type OrderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

// WithTx returns a copy of the repository bound to the given transaction.
func (r *OrderRepository) WithTx(tx *gorm.DB) *OrderRepository {
	return &OrderRepository{db: tx}
}

// withDetails preloads the associations OrderResponse.fromEntity touches.
func (r *OrderRepository) withDetails(db *gorm.DB) *gorm.DB {
	return db.
		Preload("Items").
		Preload("Items.Product").
		Preload("Customer").
		Preload("Customer.User")
}

// FindByID mirrors findById (no items — used by PaymentService where only
// the order row itself is needed).
func (r *OrderRepository) FindByID(id uint) (*domain.Order, error) {
	var order domain.Order
	if err := r.db.First(&order, id).Error; err != nil {
		return nil, err
	}
	return &order, nil
}

// FindByIDWithItems mirrors findByIdWithItems (items fetched; customer/user
// and products available via lazy loading in Java, preloaded here).
func (r *OrderRepository) FindByIDWithItems(id uint) (*domain.Order, error) {
	var order domain.Order
	if err := r.withDetails(r.db).First(&order, id).Error; err != nil {
		return nil, err
	}
	return &order, nil
}

// FindByOrderNumberWithDetails mirrors findByOrderNumberWithDetails.
func (r *OrderRepository) FindByOrderNumberWithDetails(orderNumber string) (*domain.Order, error) {
	var order domain.Order
	if err := r.withDetails(r.db).Where("order_number = ?", orderNumber).First(&order).Error; err != nil {
		return nil, err
	}
	return &order, nil
}

// FindByCustomerID mirrors findByCustomerId(pageable) — sorted createdAt
// DESC (controller default), page content fully preloaded plus total count.
func (r *OrderRepository) FindByCustomerID(customerID uint, page, size int) ([]domain.Order, int64, error) {
	var total int64
	if err := r.db.Model(&domain.Order{}).Where("customer_id = ?", customerID).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	orders := make([]domain.Order, 0)
	if err := r.withDetails(r.db).Where("customer_id = ?", customerID).
		Order("orders.created_at DESC").Offset(page * size).Limit(size).Find(&orders).Error; err != nil {
		return nil, 0, err
	}
	return orders, total, nil
}

// FindAll mirrors findAll(pageable) — createdAt DESC (controller default).
func (r *OrderRepository) FindAll(page, size int) ([]domain.Order, int64, error) {
	var total int64
	if err := r.db.Model(&domain.Order{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	orders := make([]domain.Order, 0)
	if err := r.withDetails(r.db).Order("orders.created_at DESC").
		Offset(page * size).Limit(size).Find(&orders).Error; err != nil {
		return nil, 0, err
	}
	return orders, total, nil
}

// FindByStatus mirrors findByStatus(status, pageable). The Java pageable
// has no explicit sort (undefined order); id ASC keeps pagination stable.
func (r *OrderRepository) FindByStatus(status domain.OrderStatus, page, size int) ([]domain.Order, int64, error) {
	var total int64
	if err := r.db.Model(&domain.Order{}).Where("status = ?", string(status)).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	orders := make([]domain.Order, 0)
	if err := r.withDetails(r.db).Where("status = ?", string(status)).
		Order("orders.id ASC").Offset(page * size).Limit(size).Find(&orders).Error; err != nil {
		return nil, 0, err
	}
	return orders, total, nil
}

// CountByStatus mirrors countByStatus (order stats).
func (r *OrderRepository) CountByStatus(status domain.OrderStatus) (int64, error) {
	var count int64
	if err := r.db.Model(&domain.Order{}).Where("status = ?", string(status)).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

// Create persists the order and then its items (JPA cascade=ALL parity).
// Associations are omitted explicitly so GORM never upserts the customer
// or products; item OrderID back-references are fixed after the order
// insert (Java sets them in addItem via the managed entity).
func (r *OrderRepository) Create(order *domain.Order) error {
	if err := r.db.Omit("Customer", "Items", "Payment").Create(order).Error; err != nil {
		return err
	}
	for i := range order.Items {
		order.Items[i].OrderID = order.ID
	}
	if len(order.Items) > 0 {
		if err := r.db.Omit("Order", "Product").Create(&order.Items).Error; err != nil {
			return err
		}
	}
	return nil
}

// Save updates every column of the order row (items are immutable after
// creation; JPA merge would cascade to unchanged items — a no-op).
func (r *OrderRepository) Save(order *domain.Order) error {
	return r.db.Omit("Customer", "Items", "Payment").Save(order).Error
}
