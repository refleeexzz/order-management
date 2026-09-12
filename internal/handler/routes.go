package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/refleeexzz/order-management/internal/config"
	"github.com/refleeexzz/order-management/internal/domain"
	"github.com/refleeexzz/order-management/internal/middleware"
	"github.com/refleeexzz/order-management/internal/repository"
	"github.com/refleeexzz/order-management/internal/security"
	"github.com/refleeexzz/order-management/internal/service"
	"gorm.io/gorm"
)

// App aggregates every dependency the router needs. Agents 2–4: add your
// repositories/services/handlers as fields here, then wire their routes in
// Router() — use middleware.RequireAuth / middleware.RequireRole(...) for
// the URL-level rules and re-check roles inside handlers for the
// @PreAuthorize MANAGER-quirk (effectively ADMIN-only) where the spec says so.
type App struct {
	Config          *config.Config
	DB              *gorm.DB
	UserRepo        *repository.UserRepository
	TokenProvider   *security.TokenProvider
	AuthService     *service.AuthService
	CategoryService *service.CategoryService
	ProductService  *service.ProductService
}

// Router builds the root chi router. Middleware order mirrors Spring
// Security: CORS first, then the JWT filter, then the route-level guards.
func (a *App) Router() http.Handler {
	authHandler := NewAuthHandler(a.AuthService)
	categoryHandler := NewCategoryHandler(a.CategoryService)
	productHandler := NewProductHandler(a.ProductService)

	r := chi.NewRouter()
	r.Use(middleware.CORS)
	r.Use(middleware.Auth(a.UserRepo, a.TokenProvider))

	// public endpoints (permitAll)
	r.Get("/actuator/health", Health)
	r.Route("/api/auth", func(r chi.Router) {
		r.Post("/register", authHandler.Register)
		r.Post("/login", authHandler.Login)
	})

	// Categories (§4.2). Reads are permitAll; writes carry the MANAGER-quirk
	// @PreAuthorize → effectively ADMIN-only (SELLER → 403). DELETE is ADMIN
	// at both levels.
	r.Route("/api/categories", func(r chi.Router) {
		r.With(middleware.RequireRole(domain.UserRoleAdmin)).Post("/", categoryHandler.Create)
		r.Get("/", categoryHandler.FindAllActive)
		// /all must shadow /{id} (chi prefers static segments anyway); the
		// Java endpoint passes the URL filter but is gated by @PreAuthorize.
		r.With(middleware.RequireRole(domain.UserRoleAdmin)).Get("/all", categoryHandler.FindAll)
		r.Get("/{id}", categoryHandler.FindByID)
		r.With(middleware.RequireRole(domain.UserRoleAdmin)).Put("/{id}", categoryHandler.Update)
		r.With(middleware.RequireRole(domain.UserRoleAdmin)).Delete("/{id}", categoryHandler.Deactivate)
	})

	// Products (§4.3). GET endpoints are permitAll except /low-stock
	// (@PreAuthorize ADMIN|MANAGER → ADMIN); POST/PUT/DELETE are
	// effectively ADMIN-only via the MANAGER quirk.
	r.Route("/api/products", func(r chi.Router) {
		r.With(middleware.RequireRole(domain.UserRoleAdmin)).Post("/", productHandler.Create)
		r.Get("/", productHandler.FindAllActive)
		r.Get("/sku/{sku}", productHandler.FindBySKU)
		r.Get("/category/{categoryId}", productHandler.FindByCategory)
		r.Get("/search", productHandler.Search)
		r.With(middleware.RequireRole(domain.UserRoleAdmin)).Get("/low-stock", productHandler.FindLowStock)
		r.Get("/{id}", productHandler.FindByID)
		r.With(middleware.RequireRole(domain.UserRoleAdmin)).Put("/{id}", productHandler.Update)
		r.With(middleware.RequireRole(domain.UserRoleAdmin)).Delete("/{id}", productHandler.Deactivate)
	})

	return r
}
