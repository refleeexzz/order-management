package service

import (
	"regexp"
	"testing"

	"github.com/refleeexzz/order-management/internal/domain"
)

// TestGenerateTransactionID pins generateTransactionId: method prefix +
// "-" + the first 12 chars of a UUID upper-cased — chars 9-12 are the
// UUID's first dash plus three hex chars (e.g. PIX-A1B2C3D4-E5F).
func TestGenerateTransactionID(t *testing.T) {
	pattern := regexp.MustCompile(`^(PIX|CC|DC|BOL|TED)-[0-9A-F]{8}-[0-9A-F]{3}$`)
	prefixes := map[domain.PaymentMethod]string{
		domain.PaymentMethodPix:          "PIX-",
		domain.PaymentMethodCreditCard:   "CC-",
		domain.PaymentMethodDebitCard:    "DC-",
		domain.PaymentMethodBankSlip:     "BOL-",
		domain.PaymentMethodBankTransfer: "TED-",
	}
	for method, prefix := range prefixes {
		for i := 0; i < 50; i++ {
			id := GenerateTransactionID(method)
			if !pattern.MatchString(id) {
				t.Fatalf("GenerateTransactionID(%s) = %q does not match %s", method, id, pattern)
			}
			if id[:len(prefix)] != prefix {
				t.Errorf("transaction id %q does not start with %q", id, prefix)
			}
		}
	}
}

// TestSimulatePayment pins simulatePaymentProcessing: PIX and BANK_SLIP
// always succeed; card/transfer methods need a non-empty cardToken.
func TestSimulatePayment(t *testing.T) {
	token := "tok_123"
	empty := ""
	cases := []struct {
		method domain.PaymentMethod
		token  *string
		want   bool
	}{
		{domain.PaymentMethodPix, nil, true},
		{domain.PaymentMethodPix, &empty, true},
		{domain.PaymentMethodBankSlip, nil, true},
		{domain.PaymentMethodCreditCard, &token, true},
		{domain.PaymentMethodDebitCard, &token, true},
		{domain.PaymentMethodBankTransfer, &token, true},
		{domain.PaymentMethodCreditCard, nil, false},
		{domain.PaymentMethodCreditCard, &empty, false},
		{domain.PaymentMethodDebitCard, nil, false},
		{domain.PaymentMethodBankTransfer, &empty, false},
	}
	for _, c := range cases {
		if got := SimulatePayment(c.method, c.token); got != c.want {
			t.Errorf("SimulatePayment(%s, %v) = %v, want %v", c.method, c.token, got, c.want)
		}
	}
}
