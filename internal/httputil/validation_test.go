package httputil

import (
	"testing"

	"github.com/shopspring/decimal"
)

// decminFixture exercises the decmin tag (@DecimalMin parity) in pointer
// and value form.
type decminFixture struct {
	PricePtr *decimal.Decimal `json:"price" validate:"required,decmin=0.01"`
	PriceVal decimal.Decimal  `json:"priceVal" validate:"decmin=0.01"`
}

func TestDecminValidation(t *testing.T) {
	msg := map[string]string{
		"price.required":  "price is required",
		"price.decmin":    "price must be greater than zero",
		"priceVal.decmin": "price must be greater than zero",
	}
	zero := decimal.Zero
	cent := decimal.RequireFromString("0.01")
	above := decimal.RequireFromString("9.99")

	tests := []struct {
		name       string
		fixture    decminFixture
		wantFields []string // "<field>.<tag>" keys expected, in order; empty = valid
	}{
		{
			name:       "nil pointer → required",
			fixture:    decminFixture{PricePtr: nil, PriceVal: cent},
			wantFields: []string{"price.required"},
		},
		{
			name:       "zero → decmin",
			fixture:    decminFixture{PricePtr: &zero, PriceVal: cent},
			wantFields: []string{"price.decmin"},
		},
		{
			name:       "boundary 0.01 is valid (inclusive)",
			fixture:    decminFixture{PricePtr: &cent, PriceVal: cent},
			wantFields: nil,
		},
		{
			name:       "above min valid",
			fixture:    decminFixture{PricePtr: &above, PriceVal: above},
			wantFields: nil,
		},
		{
			name:       "value form zero → decmin",
			fixture:    decminFixture{PricePtr: &above, PriceVal: decimal.Zero},
			wantFields: []string{"priceVal.decmin"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			errs := Validate(tt.fixture, msg)
			if len(errs) != len(tt.wantFields) {
				t.Fatalf("got %d errors (%v), want %d", len(errs), errs, len(tt.wantFields))
			}
			for i, key := range tt.wantFields {
				wantMsg := msg[key]
				if errs[i].Message != wantMsg {
					t.Errorf("error %d message = %q, want %q", i, errs[i].Message, wantMsg)
				}
			}
		})
	}
}
