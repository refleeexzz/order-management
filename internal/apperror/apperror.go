// Package apperror defines the typed application errors that reproduce the
// Java exception hierarchy and their exact message templates. Map errors to
// HTTP responses with httputil.WriteError.
package apperror

import "fmt"

// Kind identifies the error category (HTTP mapping is done in httputil).
type Kind int

const (
	KindNotFound Kind = iota
	KindBusiness
	KindDuplicate
	KindInsufficientStock
	KindUnauthorized
)

// Error is a typed application error carrying an exact, parity-checked
// message (same strings the Java exceptions produce).
type Error struct {
	Kind    Kind
	Message string
}

func (e *Error) Error() string { return e.Message }

// NotFound reproduces ResourceNotFoundException(name, id):
// "<name> not found with id: <id>".
func NotFound(resource string, id int64) *Error {
	return &Error{KindNotFound, fmt.Sprintf("%s not found with id: %d", resource, id)}
}

// NotFoundByField reproduces ResourceNotFoundException(name, field, value):
// "<name> not found with <field>: <value>".
func NotFoundByField(resource, field string, value interface{}) *Error {
	return &Error{KindNotFound, fmt.Sprintf("%s not found with %s: %v", resource, field, value)}
}

// NotFoundMsg reproduces ResourceNotFoundException(message) — used for the
// customer-profile messages that don't follow the id/field templates.
func NotFoundMsg(message string) *Error {
	return &Error{KindNotFound, message}
}

// Business reproduces BusinessException (HTTP 400).
func Business(message string) *Error {
	return &Error{KindBusiness, message}
}

// Duplicate reproduces DuplicateResourceException(name, field, value):
// "<name> with <field> '<value>' already exists".
func Duplicate(resource, field string, value interface{}) *Error {
	return &Error{KindDuplicate, fmt.Sprintf("%s with %s '%v' already exists", resource, field, value)}
}

// DuplicateMsg reproduces DuplicateResourceException(message) — e.g.
// "Customer profile already exists for this user".
func DuplicateMsg(message string) *Error {
	return &Error{KindDuplicate, message}
}

// InsufficientStock reproduces InsufficientStockException:
// "insufficient stock for product <id>: requested <q> but only <a> available".
func InsufficientStock(productID int64, requested, available int) *Error {
	return &Error{KindInsufficientStock, fmt.Sprintf(
		"insufficient stock for product %d: requested %d but only %d available",
		productID, requested, available)}
}

// BadCredentials reproduces the BadCredentialsException mapping:
// HTTP 401 with message "invalid email or password".
func BadCredentials() *Error {
	return &Error{KindUnauthorized, "invalid email or password"}
}

// Unauthorized creates a 401 error with a custom message (e.g. the
// "authentication required" body written by middleware.RequireAuth).
func Unauthorized(message string) *Error {
	return &Error{KindUnauthorized, message}
}
