package handler

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/refleeexzz/order-management/internal/dto"
	"github.com/refleeexzz/order-management/internal/httputil"
	"github.com/refleeexzz/order-management/internal/service"
)

// CategoryHandler mirrors controller/CategoryController (base /api/categories).
type CategoryHandler struct {
	categories *service.CategoryService
}

func NewCategoryHandler(categories *service.CategoryService) *CategoryHandler {
	return &CategoryHandler{categories: categories}
}

// Create handles POST /api/categories (ADMIN) → 201 CategoryResponse.
func (h *CategoryHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateCategoryRequest
	if !httputil.Bind(w, r, &req, dto.CreateCategoryMessages) {
		return
	}
	resp, err := h.categories.Create(req)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusCreated, resp)
}

// FindByID handles GET /api/categories/{id} (public) → 200 / 404.
func (h *CategoryHandler) FindByID(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r, "id")
	if !ok {
		return
	}
	resp, err := h.categories.FindByID(id)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusOK, resp)
}

// FindAllActive handles GET /api/categories (public) → 200 active only.
func (h *CategoryHandler) FindAllActive(w http.ResponseWriter, r *http.Request) {
	resp, err := h.categories.FindAllActive()
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusOK, resp)
}

// FindAll handles GET /api/categories/all (ADMIN) → 200 incl. inactive.
func (h *CategoryHandler) FindAll(w http.ResponseWriter, r *http.Request) {
	resp, err := h.categories.FindAll()
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusOK, resp)
}

// Update handles PUT /api/categories/{id} (ADMIN) → 200.
func (h *CategoryHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r, "id")
	if !ok {
		return
	}
	var req dto.CreateCategoryRequest
	if !httputil.Bind(w, r, &req, dto.CreateCategoryMessages) {
		return
	}
	resp, err := h.categories.Update(id, req)
	if err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	httputil.JSON(w, http.StatusOK, resp)
}

// Deactivate handles DELETE /api/categories/{id} (ADMIN) → 204 no body.
func (h *CategoryHandler) Deactivate(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r, "id")
	if !ok {
		return
	}
	if err := h.categories.Deactivate(id); err != nil {
		httputil.WriteError(w, r, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// pathID parses a numeric {id}-style path variable. A non-numeric value
// gets a 400 (Spring would fail the Long conversion the same way, albeit
// with a different body).
func pathID(w http.ResponseWriter, r *http.Request, name string) (uint, bool) {
	raw := chi.URLParam(r, name)
	id, err := strconv.ParseUint(raw, 10, 64)
	if err != nil || id == 0 {
		httputil.JSON(w, http.StatusBadRequest, httputil.ErrorResponse{
			Status:    http.StatusBadRequest,
			Error:     "Bad Request",
			Message:   "invalid " + name + ": " + raw,
			Path:      r.URL.Path,
			Timestamp: httputil.NowTimestamp(),
		})
		return 0, false
	}
	return uint(id), true
}

// pageParams parses ?page=&size= with the Spring defaults (page 0, size
// 20). Deviation from Java (documented): invalid values are clamped
// (negative page → 0, size <= 0 → default 20, size > 100 → 100, non-numeric
// → default) where Spring would reject with 400/500.
func pageParams(r *http.Request, defaultSize int) (page, size int) {
	page = 0
	size = defaultSize
	if raw := r.URL.Query().Get("page"); raw != "" {
		if n, err := strconv.Atoi(raw); err == nil {
			page = n
		}
	}
	if page < 0 {
		page = 0
	}
	if raw := r.URL.Query().Get("size"); raw != "" {
		if n, err := strconv.Atoi(raw); err == nil {
			size = n
		}
	}
	if size <= 0 {
		size = defaultSize
	}
	if size > 100 {
		size = 100
	}
	return page, size
}

// intParam parses an integer query parameter with a default; invalid values
// fall back to the default (Spring would 400 — documented deviation).
func intParam(r *http.Request, name string, def int) int {
	raw := r.URL.Query().Get(name)
	if raw == "" {
		return def
	}
	if n, err := strconv.Atoi(raw); err == nil {
		return n
	}
	return def
}
