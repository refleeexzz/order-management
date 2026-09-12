package repository

import (
	"github.com/refleeexzz/order-management/internal/domain"
	"gorm.io/gorm"
)

// PaymentRepository mirrors PaymentRepository (Spring Data). Reads preload
// the Order association — PaymentResponse flattens it into
// orderId/orderNumber.
type PaymentRepository struct {
	db *gorm.DB
}

func NewPaymentRepository(db *gorm.DB) *PaymentRepository {
	return &PaymentRepository{db: db}
}

// WithTx returns a copy of the repository bound to the given transaction.
func (r *PaymentRepository) WithTx(tx *gorm.DB) *PaymentRepository {
	return &PaymentRepository{db: tx}
}

// FindByID mirrors findById (order preloaded).
func (r *PaymentRepository) FindByID(id uint) (*domain.Payment, error) {
	var payment domain.Payment
	if err := r.db.Preload("Order").First(&payment, id).Error; err != nil {
		return nil, err
	}
	return &payment, nil
}

// FindByOrderID mirrors findByOrderId (order preloaded).
func (r *PaymentRepository) FindByOrderID(orderID uint) (*domain.Payment, error) {
	var payment domain.Payment
	if err := r.db.Preload("Order").Where("order_id = ?", orderID).First(&payment).Error; err != nil {
		return nil, err
	}
	return &payment, nil
}

// Create persists a new payment (the order association is never cascaded).
func (r *PaymentRepository) Create(payment *domain.Payment) error {
	return r.db.Omit("Order").Create(payment).Error
}

// Save updates every column of the payment row.
func (r *PaymentRepository) Save(payment *domain.Payment) error {
	return r.db.Omit("Order").Save(payment).Error
}
