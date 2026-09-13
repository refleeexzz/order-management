// Package dto holds the request/response payloads (camelCase JSON, exactly
// like the Java records/classes — no naming strategy needed).
package dto

import "github.com/refleeexzz/order-management/internal/domain"

// RegisterRequest mirrors dto/auth/RegisterRequest.
type RegisterRequest struct {
	Name     string `json:"name" validate:"notblank,min=2,max=100"`
	Email    string `json:"email" validate:"notblank,omitempty,email"`
	Password string `json:"password" validate:"notblank,min=6,max=50"`
	Role     string `json:"role"` // optional: ADMIN, SELLER, CUSTOMER (default CUSTOMER)
}

// RegisterMessages maps "<field>.<tag>" to the exact Jakarta messages.
var RegisterMessages = map[string]string{
	"name.notblank":     "name is required",
	"name.min":          "name must be between 2 and 100 characters",
	"name.max":          "name must be between 2 and 100 characters",
	"email.notblank":    "email is required",
	"email.email":       "email must be valid",
	"password.notblank": "password is required",
	"password.min":      "password must be between 6 and 50 characters",
	"password.max":      "password must be between 6 and 50 characters",
}

// LoginRequest mirrors dto/auth/LoginRequest.
type LoginRequest struct {
	Email    string `json:"email" validate:"notblank,omitempty,email"`
	Password string `json:"password" validate:"notblank"`
}

// LoginMessages maps "<field>.<tag>" to the exact Jakarta messages.
var LoginMessages = map[string]string{
	"email.notblank":    "email is required",
	"email.email":       "email must be valid",
	"password.notblank": "password is required",
}

// AuthResponse mirrors dto/auth/AuthResponse (type hardcoded "Bearer").
type AuthResponse struct {
	Token  string `json:"token"`
	Type   string `json:"type"`
	UserID uint   `json:"userId"`
	Name   string `json:"name"`
	Email  string `json:"email"`
	Role   string `json:"role"`
}

// NewAuthResponse mirrors AuthResponse.of(...).
func NewAuthResponse(token string, user *domain.User) *AuthResponse {
	return &AuthResponse{
		Token:  token,
		Type:   "Bearer",
		UserID: user.ID,
		Name:   user.Name,
		Email:  user.Email,
		Role:   string(user.Role),
	}
}
