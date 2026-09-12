package handler

import (
	"net/http"

	"github.com/refleeexzz/order-management/internal/apperror"
	"github.com/refleeexzz/order-management/internal/domain"
	"github.com/refleeexzz/order-management/internal/dto"
	"github.com/refleeexzz/order-management/internal/httputil"
	"github.com/refleeexzz/order-management/internal/service"
)

// PaymentHandler mirrors controller/PaymentController (base /api/payments).
type PaymentHandler struct {
	payments *service.PaymentService
}

func NewPaymentHandler(payments *service.PaymentService) *PaymentHandler {
	return &PaymentHandler{payments: payments}
}

// Process handles POST /api/payments (any authenticated — intentionally NO
// ownership check, Java quirk) → 201 PaymentResponse (PAID or FAILED).
// An invalid method string → 400 (Jackson enum deserialization parity).
func (h *PaymentHandler) Process(w http.ResponseWriter, r *http.Request) {
	var req dto.ProcessPaymentRequest
	if !httputil.Bind(w, r, &req, dto.ProcessPaymentMessages) {
		return
	}
	method, ok := domain.ParsePaymentMethod(req.Method)
	if !ok {
		httputil.WriteError(w, r, apperror.Business("invalid payment method: "+req.Method))
		return
	}
	resp, err := h.payments.Process(method, req)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusCreated, resp)
}

// FindByOrderID handles GET /api/payments/order/{orderId} (any
// authenticated) → 200 / 404 "Payment not found for order: <id>".
func (h *PaymentHandler) FindByOrderID(w http.ResponseWriter, r *http.Request) {
	orderID, ok := pathID(w, r, "orderId")
	if !ok {
		return
	}
	resp, err := h.payments.FindByOrderID(orderID)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusOK, resp)
}

// Refund handles POST /api/payments/{paymentId}/refund (ADMIN) → 200
// PaymentResponse; 404 missing payment; 500 refunding a non-PAID payment.
func (h *PaymentHandler) Refund(w http.ResponseWriter, r *http.Request) {
	paymentID, ok := pathID(w, r, "paymentId")
	if !ok {
		return
	}
	resp, err := h.payments.Refund(paymentID)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusOK, resp)
}
