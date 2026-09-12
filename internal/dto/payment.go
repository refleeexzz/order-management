package dto

import (
	"github.com/refleeexzz/order-management/internal/domain"
	"github.com/refleeexzz/order-management/internal/httputil"
)

// ProcessPaymentRequest mirrors dto/payment/ProcessPaymentRequest. Method is
// bound as a string (required → "payment method is required") and parsed
// against PaymentMethod in the handler — an invalid enum string fails with
// 400 like Jackson's enum deserialization error. Installments is a pointer:
// absent/null → default 1 in the service (Java field initializer + null
// check parity).
type ProcessPaymentRequest struct {
	OrderID      *uint   `json:"orderId" validate:"required"`
	Method       string  `json:"method" validate:"required"`
	Installments *int    `json:"installments" validate:"omitempty,min=1"`
	CardToken    *string `json:"cardToken"`
}

// ProcessPaymentMessages maps "<jsonField>.<tag>" to the Jakarta messages.
var ProcessPaymentMessages = map[string]string{
	"orderId.required": "order id is required",
	"method.required":  "payment method is required",
	"installments.min": "installments must be at least 1",
}

// PaymentResponse mirrors dto/payment/PaymentResponse. refundedAt is NOT
// exposed (Java parity). transactionId/paidAt are null until the payment
// succeeds.
type PaymentResponse struct {
	ID            uint                 `json:"id"`
	OrderID       uint                 `json:"orderId"`
	OrderNumber   string               `json:"orderNumber"`
	Method        domain.PaymentMethod `json:"method"`
	Status        domain.PaymentStatus `json:"status"`
	Amount        httputil.Money       `json:"amount"`
	TransactionID *string              `json:"transactionId"`
	Installments  int                  `json:"installments"`
	PaidAt        interface{}          `json:"paidAt"`
	CreatedAt     string               `json:"createdAt"`
}

// NewPaymentResponse mirrors PaymentResponse.fromEntity(payment); the
// payment's Order association must be loaded.
func NewPaymentResponse(payment *domain.Payment) *PaymentResponse {
	return &PaymentResponse{
		ID:            payment.ID,
		OrderID:       payment.OrderID,
		OrderNumber:   payment.Order.OrderNumber,
		Method:        payment.Method,
		Status:        payment.Status,
		Amount:        httputil.NewMoney(payment.Amount),
		TransactionID: payment.TransactionID,
		Installments:  payment.Installments,
		PaidAt:        httputil.LocalTimePtr(payment.PaidAt),
		CreatedAt:     httputil.LocalTime(payment.CreatedAt),
	}
}
