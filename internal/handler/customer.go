package handler

import (
	"net/http"

	"github.com/refleeexzz/order-management/internal/dto"
	"github.com/refleeexzz/order-management/internal/httputil"
	"github.com/refleeexzz/order-management/internal/middleware"
	"github.com/refleeexzz/order-management/internal/service"
)

// CustomerHandler mirrors controller/CustomerController (base /api/customers).
type CustomerHandler struct {
	customers *service.CustomerService
}

func NewCustomerHandler(customers *service.CustomerService) *CustomerHandler {
	return &CustomerHandler{customers: customers}
}

// FindAll handles GET /api/customers?page&size (ADMIN) → 200 Spring
// Page<CustomerResponse> (default size 20, sort id DESC).
func (h *CustomerHandler) FindAll(w http.ResponseWriter, r *http.Request) {
	page, size := pageParams(r, 20)
	resp, err := h.customers.FindAll(page, size)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusOK, resp)
}

// Create handles POST /api/customers (any authenticated) → 201
// CustomerResponse; 409 on duplicate profile / cpf.
func (h *CustomerHandler) Create(w http.ResponseWriter, r *http.Request) {
	user, _ := middleware.UserFromContext(r.Context())
	var req dto.CreateCustomerRequest
	if !httputil.Bind(w, r, &req, dto.CreateCustomerMessages) {
		return
	}
	resp, err := h.customers.CreateForCurrentUser(user, req)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusCreated, resp)
}

// GetMe handles GET /api/customers/me (any authenticated) → 200 / 404
// "Customer profile not found for current user".
func (h *CustomerHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	user, _ := middleware.UserFromContext(r.Context())
	resp, err := h.customers.GetCurrentCustomer(user.ID)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusOK, resp)
}

// UpdateMe handles PUT /api/customers/me (any authenticated) → 200;
// updates phone + address only (cpf is not updatable).
func (h *CustomerHandler) UpdateMe(w http.ResponseWriter, r *http.Request) {
	user, _ := middleware.UserFromContext(r.Context())
	var req dto.CreateCustomerRequest
	if !httputil.Bind(w, r, &req, dto.CreateCustomerMessages) {
		return
	}
	resp, err := h.customers.UpdateCurrentCustomer(user.ID, req)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusOK, resp)
}

// FindByID handles GET /api/customers/{id} (ADMIN) → 200 / 404 "Customer
// not found with id: <id>".
func (h *CustomerHandler) FindByID(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r, "id")
	if !ok {
		return
	}
	resp, err := h.customers.FindByID(id)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusOK, resp)
}
