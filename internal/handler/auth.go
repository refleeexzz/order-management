// Package handler contains the HTTP handlers and the route wiring.
package handler

import (
	"net/http"

	"github.com/refleeexzz/order-management/internal/dto"
	"github.com/refleeexzz/order-management/internal/httputil"
	"github.com/refleeexzz/order-management/internal/service"
)

// AuthHandler mirrors controller/AuthController (base /api/auth, public).
type AuthHandler struct {
	auth *service.AuthService
}

func NewAuthHandler(auth *service.AuthService) *AuthHandler {
	return &AuthHandler{auth: auth}
}

// Register handles POST /api/auth/register → 201 AuthResponse.
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req dto.RegisterRequest
	if !httputil.Bind(w, r, &req, dto.RegisterMessages) {
		return
	}
	resp, err := h.auth.Register(req)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusCreated, resp)
}

// Login handles POST /api/auth/login → 200 AuthResponse.
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req dto.LoginRequest
	if !httputil.Bind(w, r, &req, dto.LoginMessages) {
		return
	}
	resp, err := h.auth.Login(req)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusOK, resp)
}

// Health handles GET /actuator/health → 200 {"status":"UP"}.
func Health(w http.ResponseWriter, r *http.Request) {
	httputil.JSON(w, http.StatusOK, map[string]string{"status": "UP"})
}
