package service

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/refleeexzz/order-management/internal/apperror"
	"github.com/refleeexzz/order-management/internal/domain"
	"github.com/refleeexzz/order-management/internal/dto"
	"github.com/refleeexzz/order-management/internal/repository"
	"gorm.io/gorm"
)

// PaymentService mirrors service/PaymentService. Processing runs in ONE
// transaction (Java @Transactional parity): the payment row and, on
// success, the order's PAID transition commit or roll back together.
type PaymentService struct {
	db       *gorm.DB
	payments *repository.PaymentRepository
	orders   *repository.OrderRepository
}

func NewPaymentService(db *gorm.DB, payments *repository.PaymentRepository, orders *repository.OrderRepository) *PaymentService {
	return &PaymentService{db: db, payments: payments, orders: orders}
}

// Process mirrors processPayment (§5.6): 404 for a missing order, 400 when
// the order is not PENDING_PAYMENT or a payment already exists, then the
// simulated gateway decides PAID vs FAILED (201 either way). NO ownership
// check — any authenticated user can pay any order (Java quirk, kept).
func (s *PaymentService) Process(method domain.PaymentMethod, req dto.ProcessPaymentRequest) (*dto.PaymentResponse, error) {
	var processed *domain.Payment
	err := s.db.Transaction(func(tx *gorm.DB) error {
		orders := s.orders.WithTx(tx)
		payments := s.payments.WithTx(tx)

		order, err := orders.FindByID(*req.OrderID)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apperror.NotFound("Order", int64(*req.OrderID))
		}
		if err != nil {
			return err
		}

		if order.Status != domain.OrderStatusPendingPayment {
			return apperror.Business("order is not awaiting payment")
		}

		if _, err := payments.FindByOrderID(order.ID); err == nil {
			return apperror.Business("payment already exists for this order")
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}

		installments := 1
		if req.Installments != nil {
			installments = *req.Installments
		}

		payment := &domain.Payment{
			OrderID:      order.ID,
			Method:       method,
			Status:       domain.PaymentStatusPending,
			Amount:       order.Total,
			Installments: installments,
		}

		if SimulatePayment(method, req.CardToken) {
			payment.Confirm(GenerateTransactionID(method))
			// Cannot fail: the status was checked above (Java calls the
			// entity method the same way).
			if err := order.ConfirmPayment(); err != nil {
				return err
			}
			if err := orders.Save(order); err != nil {
				return err
			}
		} else {
			payment.Status = domain.PaymentStatusFailed
		}

		if err := payments.Create(payment); err != nil {
			return err
		}
		payment.Order = *order
		processed = payment
		return nil
	})
	if err != nil {
		return nil, err
	}
	return dto.NewPaymentResponse(processed), nil
}

// FindByOrderID mirrors findByOrderId → 404 "Payment not found for order:
// <id>".
func (s *PaymentService) FindByOrderID(orderID uint) (*dto.PaymentResponse, error) {
	payment, err := s.payments.FindByOrderID(orderID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apperror.NotFoundMsg(fmt.Sprintf("Payment not found for order: %d", orderID))
	}
	if err != nil {
		return nil, err
	}
	return dto.NewPaymentResponse(payment), nil
}

// Refund mirrors refund (ADMIN): 404 for a missing payment; refund()
// requires PAID — a guard violation is a PLAIN error (Java
// IllegalStateException → HTTP 500). The order is NOT changed on refund.
func (s *PaymentService) Refund(paymentID uint) (*dto.PaymentResponse, error) {
	payment, err := s.payments.FindByID(paymentID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apperror.NotFound("Payment", int64(paymentID))
	}
	if err != nil {
		return nil, err
	}
	if err := payment.Refund(); err != nil {
		return nil, err // "payment cannot be refunded" → 500
	}
	if err := s.payments.Save(payment); err != nil {
		return nil, err
	}
	return dto.NewPaymentResponse(payment), nil
}

// SimulatePayment mirrors simulatePaymentProcessing (including the 100ms
// gateway latency): PIX and BANK_SLIP always succeed; every other method
// succeeds only with a non-empty cardToken.
func SimulatePayment(method domain.PaymentMethod, cardToken *string) bool {
	time.Sleep(100 * time.Millisecond)
	if method == domain.PaymentMethodPix || method == domain.PaymentMethodBankSlip {
		return true
	}
	return cardToken != nil && *cardToken != ""
}

// GenerateTransactionID mirrors generateTransactionId:
// <prefix>-<first 12 chars of a random UUID, upper-cased>. The 12-char
// window includes the UUID's first dash (chars 9-12 are "-xxx"), exactly
// like the Java substring — e.g. PIX-A1B2C3D4-E5F.
func GenerateTransactionID(method domain.PaymentMethod) string {
	var prefix string
	switch method {
	case domain.PaymentMethodPix:
		prefix = "PIX"
	case domain.PaymentMethodCreditCard:
		prefix = "CC"
	case domain.PaymentMethodDebitCard:
		prefix = "DC"
	case domain.PaymentMethodBankSlip:
		prefix = "BOL"
	case domain.PaymentMethodBankTransfer:
		prefix = "TED"
	}
	return prefix + "-" + strings.ToUpper(newUUIDString()[:12])
}
