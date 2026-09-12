package domain

import "strings"

// UserRole mirrors com.ordermanagement.domain.enums.UserRole.
type UserRole string

const (
	UserRoleAdmin    UserRole = "ADMIN"
	UserRoleSeller   UserRole = "SELLER"
	UserRoleCustomer UserRole = "CUSTOMER"
)

// ParseUserRole reproduces AuthService.register role parsing: the input is
// upper-cased and matched against UserRole; blank or unknown values fall
// back to CUSTOMER. Note: no trimming, exactly like the Java code.
func ParseUserRole(s string) UserRole {
	switch UserRole(strings.ToUpper(s)) {
	case UserRoleAdmin:
		return UserRoleAdmin
	case UserRoleSeller:
		return UserRoleSeller
	default:
		return UserRoleCustomer
	}
}

// IsValid reports whether r is one of the declared enum constants.
func (r UserRole) IsValid() bool {
	switch r {
	case UserRoleAdmin, UserRoleSeller, UserRoleCustomer:
		return true
	}
	return false
}

// OrderStatus mirrors com.ordermanagement.domain.enums.OrderStatus.
type OrderStatus string

const (
	OrderStatusPendingPayment OrderStatus = "PENDING_PAYMENT"
	OrderStatusPaid           OrderStatus = "PAID"
	OrderStatusProcessing     OrderStatus = "PROCESSING"
	OrderStatusShipped        OrderStatus = "SHIPPED"
	OrderStatusDelivered      OrderStatus = "DELIVERED"
	OrderStatusCancelled      OrderStatus = "CANCELLED"
)

// ParseOrderStatus converts a string to an OrderStatus; the second return
// value is false for unknown values (unlike ParseUserRole there is no
// fallback — the Java code uses OrderStatus.valueOf which throws).
func ParseOrderStatus(s string) (OrderStatus, bool) {
	st := OrderStatus(s)
	return st, st.IsValid()
}

func (s OrderStatus) IsValid() bool {
	switch s {
	case OrderStatusPendingPayment, OrderStatusPaid, OrderStatusProcessing,
		OrderStatusShipped, OrderStatusDelivered, OrderStatusCancelled:
		return true
	}
	return false
}

// PaymentMethod mirrors com.ordermanagement.domain.enums.PaymentMethod.
type PaymentMethod string

const (
	PaymentMethodCreditCard   PaymentMethod = "CREDIT_CARD"
	PaymentMethodDebitCard    PaymentMethod = "DEBIT_CARD"
	PaymentMethodPix          PaymentMethod = "PIX"
	PaymentMethodBankSlip     PaymentMethod = "BANK_SLIP"
	PaymentMethodBankTransfer PaymentMethod = "BANK_TRANSFER"
)

// ParsePaymentMethod converts a string to a PaymentMethod; the second
// return value is false for unknown values.
func ParsePaymentMethod(s string) (PaymentMethod, bool) {
	m := PaymentMethod(s)
	return m, m.IsValid()
}

func (m PaymentMethod) IsValid() bool {
	switch m {
	case PaymentMethodCreditCard, PaymentMethodDebitCard, PaymentMethodPix,
		PaymentMethodBankSlip, PaymentMethodBankTransfer:
		return true
	}
	return false
}

// PaymentStatus mirrors com.ordermanagement.domain.enums.PaymentStatus.
type PaymentStatus string

const (
	PaymentStatusPending   PaymentStatus = "PENDING"
	PaymentStatusPaid      PaymentStatus = "PAID"
	PaymentStatusFailed    PaymentStatus = "FAILED"
	PaymentStatusRefunded  PaymentStatus = "REFUNDED"
	PaymentStatusCancelled PaymentStatus = "CANCELLED"
)

func (s PaymentStatus) IsValid() bool {
	switch s {
	case PaymentStatusPending, PaymentStatusPaid, PaymentStatusFailed,
		PaymentStatusRefunded, PaymentStatusCancelled:
		return true
	}
	return false
}
