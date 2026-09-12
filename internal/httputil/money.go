package httputil

import "github.com/shopspring/decimal"

// Money serializes a decimal.Decimal the way Jackson serializes a
// BigDecimal: a JSON NUMBER that preserves the value's scale — trailing
// zeros are kept (25.50 stays 25.50), matching how BigDecimal reads from
// the numeric(10,2) columns and how Java DTOs are rendered.
//
// Background: shopspring/decimal marshals as a quoted, trailing-zero-
// trimmed JSON string by default ("25.5"), which breaks parity. Request
// DTOs still bind into *decimal.Decimal; response DTOs must wrap money
// values with httputil.NewMoney (agents 3-4: this includes order/payment
// subtotal, discount, shippingCost, total, unitPrice and amount).
type Money decimal.Decimal

// NewMoney wraps a decimal for Jackson/BigDecimal-parity JSON output.
func NewMoney(d decimal.Decimal) Money { return Money(d) }

// MarshalJSON renders the value as an unquoted number with exactly the
// decimal's own scale (StringFixed(-exp) loses nothing: rendering with the
// stored exponent never rounds).
func (m Money) MarshalJSON() ([]byte, error) {
	d := decimal.Decimal(m)
	if exp := d.Exponent(); exp < 0 {
		return []byte(d.StringFixed(-exp)), nil
	}
	return []byte(d.String()), nil
}

// normalizeRejectedValue converts rejected values that would otherwise
// break Jackson parity in validation fieldErrors — decimals become Money
// (Jackson writes BigDecimal as a plain number, e.g. rejectedValue: 0).
func normalizeRejectedValue(v interface{}) interface{} {
	switch t := v.(type) {
	case decimal.Decimal:
		return NewMoney(t)
	case *decimal.Decimal:
		if t == nil {
			return nil
		}
		return NewMoney(*t)
	}
	return v
}
