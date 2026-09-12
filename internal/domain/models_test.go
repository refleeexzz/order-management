package domain

import (
	"testing"

	"github.com/shopspring/decimal"
)

// TestOrderTransitionGuards pins the entity guard methods with the exact
// IllegalStateException messages (they surface as HTTP 500 via the generic
// handler — the messages are NOT exposed, but the domain contract is).
func TestOrderTransitionGuards(t *testing.T) {
	newOrder := func(status OrderStatus) *Order { return &Order{Status: status} }

	// confirmPayment: only from PENDING_PAYMENT.
	if err := newOrder(OrderStatusPendingPayment).ConfirmPayment(); err != nil {
		t.Errorf("ConfirmPayment from PENDING_PAYMENT: %v", err)
	}
	for _, s := range []OrderStatus{OrderStatusPaid, OrderStatusProcessing, OrderStatusShipped, OrderStatusDelivered, OrderStatusCancelled} {
		err := newOrder(s).ConfirmPayment()
		if err == nil || err.Error() != "order is not awaiting payment" {
			t.Errorf("ConfirmPayment from %s = %v, want guard error", s, err)
		}
	}

	// ship: only from PAID or PROCESSING.
	for _, s := range []OrderStatus{OrderStatusPaid, OrderStatusProcessing} {
		if err := newOrder(s).Ship(); err != nil {
			t.Errorf("Ship from %s: %v", s, err)
		}
	}
	for _, s := range []OrderStatus{OrderStatusPendingPayment, OrderStatusShipped, OrderStatusDelivered, OrderStatusCancelled} {
		err := newOrder(s).Ship()
		if err == nil || err.Error() != "order cannot be shipped in current status" {
			t.Errorf("Ship from %s = %v, want guard error", s, err)
		}
	}

	// deliver: only from SHIPPED.
	if err := newOrder(OrderStatusShipped).Deliver(); err != nil {
		t.Errorf("Deliver from SHIPPED: %v", err)
	}
	for _, s := range []OrderStatus{OrderStatusPendingPayment, OrderStatusPaid, OrderStatusProcessing, OrderStatusDelivered, OrderStatusCancelled} {
		err := newOrder(s).Deliver()
		if err == nil || err.Error() != "order hasn't been shipped yet" {
			t.Errorf("Deliver from %s = %v, want guard error", s, err)
		}
	}

	// cancel: any status EXCEPT DELIVERED.
	for _, s := range []OrderStatus{OrderStatusPendingPayment, OrderStatusPaid, OrderStatusProcessing, OrderStatusShipped, OrderStatusCancelled} {
		o := newOrder(s)
		if err := o.Cancel(); err != nil {
			t.Errorf("Cancel from %s: %v", s, err)
		}
		if o.Status != OrderStatusCancelled || o.CancelledAt == nil {
			t.Errorf("Cancel from %s did not set CANCELLED + cancelledAt", s)
		}
	}
	err := newOrder(OrderStatusDelivered).Cancel()
	if err == nil || err.Error() != "order already delivered, cannot be cancelled" {
		t.Errorf("Cancel from DELIVERED = %v, want guard error", err)
	}
}

// TestPaymentRefundGuard pins Payment.refund: only from PAID, setting
// REFUNDED + refundedAt.
func TestPaymentRefundGuard(t *testing.T) {
	p := &Payment{Status: PaymentStatusPaid}
	if err := p.Refund(); err != nil {
		t.Fatalf("Refund from PAID: %v", err)
	}
	if p.Status != PaymentStatusRefunded || p.RefundedAt == nil {
		t.Error("Refund did not set REFUNDED + refundedAt")
	}
	// Refunding again (now REFUNDED) must fail with the exact message.
	if err := p.Refund(); err == nil || err.Error() != "payment cannot be refunded" {
		t.Errorf("second Refund = %v, want guard error", err)
	}
	for _, s := range []PaymentStatus{PaymentStatusPending, PaymentStatusFailed, PaymentStatusCancelled} {
		if err := (&Payment{Status: s}).Refund(); err == nil {
			t.Errorf("Refund from %s must fail", s)
		}
	}
}

// TestRecalculateTotal pins subtotal/total math incl. discount + shipping.
func TestRecalculateTotal(t *testing.T) {
	o := &Order{
		Discount:     decimal.RequireFromString("10.00"),
		ShippingCost: decimal.RequireFromString("15.00"),
	}
	o.AddItem(OrderItem{Quantity: 2, UnitPrice: decimal.RequireFromString("25.50"), Total: decimal.RequireFromString("51.00")})
	o.AddItem(OrderItem{Quantity: 1, UnitPrice: decimal.RequireFromString("9.99"), Total: decimal.RequireFromString("9.99")})
	if got := o.Subtotal.String(); got != "60.99" {
		t.Errorf("subtotal = %s, want 60.99", got)
	}
	if got := o.Total.String(); got != "65.99" {
		t.Errorf("total = %s, want 65.99 (60.99 - 10.00 + 15.00)", got)
	}
}
