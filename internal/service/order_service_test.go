package service

import (
	"regexp"
	"strings"
	"testing"
	"time"

	"github.com/refleeexzz/order-management/internal/httputil"
	"github.com/shopspring/decimal"
)

// TestGenerateOrderNumber pins the format of OrderService.generateOrderNumber:
// "ORD-" + yyyyMMdd + "-" + 5 upper-cased hex chars (the first 5 chars of a
// UUID string never include a dash).
func TestGenerateOrderNumber(t *testing.T) {
	pattern := regexp.MustCompile(`^ORD-\d{8}-[0-9A-F]{5}$`)
	for i := 0; i < 200; i++ {
		n := GenerateOrderNumber()
		if !pattern.MatchString(n) {
			t.Fatalf("GenerateOrderNumber() = %q does not match %s", n, pattern)
		}
		if len(n) > 20 {
			t.Fatalf("order number %q exceeds the varchar(20) column", n)
		}
	}
	// The date part must be today's local date (LocalDateTime.now() parity).
	if got := GenerateOrderNumber(); !strings.HasPrefix(got, "ORD-"+time.Now().Format("20060102")+"-") {
		t.Errorf("order number %q does not start with today's date", got)
	}
}

// TestApplyCoupon pins the coupon rules: FIRST10 (case-insensitive) → 10%
// of the subtotal rounded half-up to 2dp; anything else → zero discount.
// Values are compared through their JSON money rendering (scale matters:
// BigDecimal 10.00 ≠ 10 in the API contract).
func TestApplyCoupon(t *testing.T) {
	cases := []struct {
		name     string
		code     string
		subtotal string
		wantJSON string
	}{
		{"upper", "FIRST10", "100.00", "10.00"},
		{"lower", "first10", "100.00", "10.00"},
		{"mixed", "First10", "100.00", "10.00"},
		{"half-up rounds up", "FIRST10", "25.55", "2.56"},   // 2.555 → 2.56
		{"half-up rounds down", "FIRST10", "25.54", "2.55"}, // 2.554 → 2.55
		{"odd cents", "FIRST10", "9.99", "1.00"},            // 0.999 → 1.00
		{"unknown", "SAVE20", "100.00", "0"},
		{"empty", "", "100.00", "0"},
		{"near miss", "FIRST1O", "100.00", "0"}, // letter O, not zero
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			got := ApplyCoupon(c.code, decimal.RequireFromString(c.subtotal))
			json, err := httputil.NewMoney(got).MarshalJSON()
			if err != nil {
				t.Fatal(err)
			}
			if string(json) != c.wantJSON {
				t.Errorf("ApplyCoupon(%q, %s) renders %s, want %s", c.code, c.subtotal, json, c.wantJSON)
			}
		})
	}
}

// TestCancelNote pins the note append of OrderService.cancel, including the
// literal "null" produced by Java string-concat when ?reason= is absent.
func TestCancelNote(t *testing.T) {
	cases := []struct {
		name     string
		existing string
		reason   string
		want     string
	}{
		{"no notes with reason", "", "teste", "cancelled: teste"},
		{"existing notes with reason", "please deliver fast", "teste", "please deliver fast | cancelled: teste"},
		{"no notes absent reason", "", "", "cancelled: null"},
		{"existing notes absent reason", "note", "", "note | cancelled: null"},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			if got := CancelNote(c.existing, c.reason); got != c.want {
				t.Errorf("CancelNote(%q, %q) = %q, want %q", c.existing, c.reason, got, c.want)
			}
		})
	}
}
