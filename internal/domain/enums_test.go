package domain

import "testing"

// TestParseUserRole pins the AuthService.register fallback behavior:
// upper-cased exact match wins, anything else (including untrimmed
// whitespace and blanks) falls back to CUSTOMER.
func TestParseUserRole(t *testing.T) {
	cases := []struct {
		in   string
		want UserRole
	}{
		{"ADMIN", UserRoleAdmin},
		{"admin", UserRoleAdmin},
		{"Admin", UserRoleAdmin},
		{"SELLER", UserRoleSeller},
		{"seller", UserRoleSeller},
		{"CUSTOMER", UserRoleCustomer},
		{"customer", UserRoleCustomer},
		{"garbage", UserRoleCustomer},
		{"", UserRoleCustomer},
		{"   ", UserRoleCustomer},
		{" admin", UserRoleCustomer}, // Java does not trim → valueOf fails → CUSTOMER
		{"MANAGER", UserRoleCustomer},
	}
	for _, c := range cases {
		if got := ParseUserRole(c.in); got != c.want {
			t.Errorf("ParseUserRole(%q) = %q, want %q", c.in, got, c.want)
		}
	}
}

func TestParseOrderStatus(t *testing.T) {
	for _, s := range []string{"PENDING_PAYMENT", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"} {
		if got, ok := ParseOrderStatus(s); !ok || got != OrderStatus(s) {
			t.Errorf("ParseOrderStatus(%q) = %q, %v", s, got, ok)
		}
	}
	if _, ok := ParseOrderStatus("PENDING"); ok {
		t.Error("PENDING must not parse (frontend quirk — not a valid backend status)")
	}
	if _, ok := ParseOrderStatus("CONFIRMED"); ok {
		t.Error("CONFIRMED must not parse")
	}
}

func TestParsePaymentMethod(t *testing.T) {
	for _, m := range []string{"CREDIT_CARD", "DEBIT_CARD", "PIX", "BANK_SLIP", "BANK_TRANSFER"} {
		if got, ok := ParsePaymentMethod(m); !ok || got != PaymentMethod(m) {
			t.Errorf("ParsePaymentMethod(%q) = %q, %v", m, got, ok)
		}
	}
	if _, ok := ParsePaymentMethod("CASH"); ok {
		t.Error("CASH must not parse")
	}
}
