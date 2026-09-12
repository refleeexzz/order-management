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
	CustomerService *service.CustomerService
	OrderService    *service.OrderService
	PaymentService  *service.PaymentService
}

// Router builds the root chi router. Middleware order mirrors Spring
// Security: CORS first, then the JWT filter, then the route-level guards.
func (a *App) Router() http.Handler {
	authHandler := NewAuthHandler(a.AuthService)
	categoryHandler := NewCategoryHandler(a.CategoryService)
	productHandler := NewProductHandler(a.ProductService)
	customerHandler := NewCustomerHandler(a.CustomerService)
	orderHandler := NewOrderHandler(a.OrderService)
	paymentHandler := NewPaymentHandler(a.PaymentService)

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

	// Customers (§4.4). All endpoints require authentication; the list and
	// get-by-id carry the MANAGER-quirk @PreAuthorize → effectively ADMIN
	// (SELLER → 403). /me shadows /{id} (chi prefers static segments, like
	// Spring's exact-match-first).
	r.Route("/api/customers", func(r chi.Router) {
		r.With(middleware.RequireRole(domain.UserRoleAdmin)).Get("/", customerHandler.FindAll)
		r.With(middleware.RequireAuth).Post("/", customerHandler.Create)
		r.With(middleware.RequireAuth).Get("/me", customerHandler.GetMe)
		r.With(middleware.RequireAuth).Put("/me", customerHandler.UpdateMe)
		r.With(middleware.RequireRole(domain.UserRoleAdmin)).Get("/{id}", customerHandler.FindByID)
	})

	// Orders (§4.5). All endpoints require authentication; admin lists,
	// status transitions and stats carry the MANAGER quirk (ADMIN only).
	// Static segments (my-orders, stats, number, status) shadow /{id}.
	r.Route("/api/orders", func(r chi.Router) {
		r.With(middleware.RequireAuth).Post("/", orderHandler.Create)
		r.With(middleware.RequireRole(domain.UserRoleAdmin)).Get("/", orderHandler.FindAll)
		r.With(middleware.RequireAuth).Get("/my-orders", orderHandler.FindMyOrders)
		r.With(middleware.RequireRole(domain.UserRoleAdmin)).Get("/stats", orderHandler.GetStats)
		r.With(middleware.RequireRole(domain.UserRoleAdmin)).Get("/status/{status}", orderHandler.FindByStatus)
		r.With(middleware.RequireAuth).Get("/number/{orderNumber}", orderHandler.FindByOrderNumber)
		r.With(middleware.RequireAuth).Get("/{id}", orderHandler.FindByID)
		r.With(middleware.RequireRole(domain.UserRoleAdmin)).Patch("/{id}/status", orderHandler.UpdateStatus)
		r.With(middleware.RequireAuth).Post("/{id}/cancel", orderHandler.Cancel)
	})

	// Payments (§4.6). Processing intentionally has NO ownership check
	// (Java quirk); refund is hasRole('ADMIN').
	r.Route("/api/payments", func(r chi.Router) {
		r.With(middleware.RequireAuth).Post("/", paymentHandler.Process)
		r.With(middleware.RequireAuth).Get("/order/{orderId}", paymentHandler.FindByOrderID)
		r.With(middleware.RequireRole(domain.UserRoleAdmin)).Post("/{paymentId}/refund", paymentHandler.Refund)
	})

	return r
}
