package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/refleeexzz/order-management/internal/apperror"
	"github.com/refleeexzz/order-management/internal/domain"
	"github.com/refleeexzz/order-management/internal/dto"
	"github.com/refleeexzz/order-management/internal/httputil"
	"github.com/refleeexzz/order-management/internal/middleware"
	"github.com/refleeexzz/order-management/internal/service"
)

// OrderHandler mirrors controller/OrderController (base /api/orders).
type OrderHandler struct {
	orders *service.OrderService
}

func NewOrderHandler(orders *service.OrderService) *OrderHandler {
	return &OrderHandler{orders: orders}
}

// Create handles POST /api/orders (any authenticated with a customer
// profile) → 201 OrderResponse.
func (h *OrderHandler) Create(w http.ResponseWriter, r *http.Request) {
	user, _ := middleware.UserFromContext(r.Context())
	var req dto.CreateOrderRequest
	if !httputil.Bind(w, r, &req, dto.CreateOrderMessages) {
		return
	}
	resp, err := h.orders.Create(user.ID, req)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusCreated, resp)
}

// FindByID handles GET /api/orders/{id} (owner or ADMIN) → 200 / 404 / 400.
func (h *OrderHandler) FindByID(w http.ResponseWriter, r *http.Request) {
	user, _ := middleware.UserFromContext(r.Context())
	id, ok := pathID(w, r, "id")
	if !ok {
		return
	}
	resp, err := h.orders.FindByID(user, id)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusOK, resp)
}

// FindByOrderNumber handles GET /api/orders/number/{orderNumber} (owner or
// ADMIN) → 200 / 404 / 400.
func (h *OrderHandler) FindByOrderNumber(w http.ResponseWriter, r *http.Request) {
	user, _ := middleware.UserFromContext(r.Context())
	orderNumber := chi.URLParam(r, "orderNumber")
	resp, err := h.orders.FindByOrderNumber(user, orderNumber)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusOK, resp)
}

// FindMyOrders handles GET /api/orders/my-orders?page&size (any
// authenticated) → 200 PageResponse (default size 10, createdAt DESC).
func (h *OrderHandler) FindMyOrders(w http.ResponseWriter, r *http.Request) {
	user, _ := middleware.UserFromContext(r.Context())
	page, size := pageParams(r, 10)
	resp, err := h.orders.FindMyOrders(user.ID, page, size)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusOK, resp)
}

// FindAll handles GET /api/orders?page&size (ADMIN) → 200 PageResponse
// (default size 20, createdAt DESC).
func (h *OrderHandler) FindAll(w http.ResponseWriter, r *http.Request) {
	page, size := pageParams(r, 20)
	resp, err := h.orders.FindAll(page, size)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusOK, resp)
}

// FindByStatus handles GET /api/orders/status/{status}?page&size (ADMIN).
// The path variable is parsed case-sensitively against OrderStatus; an
// invalid value → 400 (Spring returns 400/500 here — the frontend never
// sends invalid values; documented deviation).
func (h *OrderHandler) FindByStatus(w http.ResponseWriter, r *http.Request) {
	raw := chi.URLParam(r, "status")
	status, ok := domain.ParseOrderStatus(raw)
	if !ok {
		httputil.WriteError(w, r, apperror.Business("invalid status: "+raw))
		return
	}
	page, size := pageParams(r, 20)
	resp, err := h.orders.FindByStatus(status, page, size)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusOK, resp)
}

// UpdateStatus handles PATCH /api/orders/{id}/status (ADMIN) → 200
// OrderResponse. An invalid status STRING fails binding with 400 (Jackson
// enum deserialization parity); a valid-but-illegal transition follows the
// service switch (400 business / 500 entity guard).
func (h *OrderHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r, "id")
	if !ok {
		return
	}
	var req dto.UpdateOrderStatusRequest
	if !httputil.Bind(w, r, &req, dto.UpdateOrderStatusMessages) {
		return
	}
	if _, ok := domain.ParseOrderStatus(req.Status); !ok {
		httputil.WriteError(w, r, apperror.Business("invalid status: "+req.Status))
		return
	}
	resp, err := h.orders.UpdateStatus(id, req)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusOK, resp)
}

// Cancel handles POST /api/orders/{id}/cancel?reason=... (owner or ADMIN)
// → 200 OrderResponse. An absent reason becomes the literal string "null"
// in the appended note (Java String-concat-with-null parity).
func (h *OrderHandler) Cancel(w http.ResponseWriter, r *http.Request) {
	user, _ := middleware.UserFromContext(r.Context())
	id, ok := pathID(w, r, "id")
	if !ok {
		return
	}
	reason := r.URL.Query().Get("reason")
	resp, err := h.orders.Cancel(user, id, reason)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusOK, resp)
}

// GetStats handles GET /api/orders/stats (ADMIN) → 200 OrderStats.
func (h *OrderHandler) GetStats(w http.ResponseWriter, r *http.Request) {
	resp, err := h.orders.GetOrderStats()
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusOK, resp)
}
