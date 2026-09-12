package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/refleeexzz/order-management/internal/dto"
	"github.com/refleeexzz/order-management/internal/httputil"
	"github.com/refleeexzz/order-management/internal/service"
)

// ProductHandler mirrors controller/ProductController (base /api/products).
type ProductHandler struct {
	products *service.ProductService
}

func NewProductHandler(products *service.ProductService) *ProductHandler {
	return &ProductHandler{products: products}
}

// Create handles POST /api/products (ADMIN) → 201 ProductResponse.
func (h *ProductHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateProductRequest
	if !httputil.Bind(w, r, &req, dto.CreateProductMessages) {
		return
	}
	resp, err := h.products.Create(req)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusCreated, resp)
}

// FindByID handles GET /api/products/{id} (public) → 200 / 404.
func (h *ProductHandler) FindByID(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r, "id")
	if !ok {
		return
	}
	resp, err := h.products.FindByID(id)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusOK, resp)
}

// FindBySKU handles GET /api/products/sku/{sku} (public) → 200 / 404.
func (h *ProductHandler) FindBySKU(w http.ResponseWriter, r *http.Request) {
	sku := chi.URLParam(r, "sku")
	resp, err := h.products.FindBySKU(sku)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusOK, resp)
}

// FindAllActive handles GET /api/products?page=0&size=20 (public) → 200
// PageResponse, active only, sorted by name ASC (the sort param is ignored,
// exactly like the Java controller's hardcoded Sort.by("name")).
func (h *ProductHandler) FindAllActive(w http.ResponseWriter, r *http.Request) {
	page, size := pageParams(r, 20)
	resp, err := h.products.FindAllActive(page, size)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusOK, resp)
}

// FindByCategory handles GET /api/products/category/{categoryId} (public).
func (h *ProductHandler) FindByCategory(w http.ResponseWriter, r *http.Request) {
	categoryID, ok := pathID(w, r, "categoryId")
	if !ok {
		return
	}
	page, size := pageParams(r, 20)
	resp, err := h.products.FindByCategory(categoryID, page, size)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusOK, resp)
}

// Search handles GET /api/products/search?query=... (public). The query
// param is REQUIRED (@RequestParam String query) — absent → 400; present
// but empty searches '%' like Java.
func (h *ProductHandler) Search(w http.ResponseWriter, r *http.Request) {
	values, present := r.URL.Query()["query"]
	if !present || len(values) == 0 {
		httputil.JSON(w, http.StatusBadRequest, httputil.ErrorResponse{
			Status:    http.StatusBadRequest,
			Error:     "Bad Request",
			Message:   "required request parameter 'query' is not present",
			Path:      r.URL.Path,
			Timestamp: httputil.NowTimestamp(),
		})
		return
	}
	page, size := pageParams(r, 20)
	resp, err := h.products.Search(values[0], page, size)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusOK, resp)
}

// FindLowStock handles GET /api/products/low-stock?threshold=10 (ADMIN) →
// 200 unpaged list of active products with stockQuantity <= threshold.
func (h *ProductHandler) FindLowStock(w http.ResponseWriter, r *http.Request) {
	threshold := intParam(r, "threshold", 10)
	resp, err := h.products.FindLowStock(threshold)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusOK, resp)
}

// Update handles PUT /api/products/{id} (ADMIN) → 200 (partial update).
func (h *ProductHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r, "id")
	if !ok {
		return
	}
	var req dto.UpdateProductRequest
	if !httputil.Bind(w, r, &req, dto.UpdateProductMessages) {
		return
	}
	resp, err := h.products.Update(id, req)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusOK, resp)
}

// Deactivate handles DELETE /api/products/{id} (ADMIN) → 204 no body.
func (h *ProductHandler) Deactivate(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r, "id")
	if !ok {
		return
	}
	if err := h.products.Deactivate(id); err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
