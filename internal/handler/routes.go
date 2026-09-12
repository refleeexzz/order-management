package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/refleeexzz/order-management/internal/config"
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
	Config        *config.Config
	DB            *gorm.DB
	UserRepo      *repository.UserRepository
	TokenProvider *security.TokenProvider
	AuthService   *service.AuthService
}

// Router builds the root chi router. Middleware order mirrors Spring
// Security: CORS first, then the JWT filter, then the route-level guards.
func (a *App) Router() http.Handler {
	authHandler := NewAuthHandler(a.AuthService)

	r := chi.NewRouter()
	r.Use(middleware.CORS)
	r.Use(middleware.Auth(a.UserRepo, a.TokenProvider))

	// public endpoints (permitAll)
	r.Get("/actuator/health", Health)
	r.Route("/api/auth", func(r chi.Router) {
		r.Post("/register", authHandler.Register)
		r.Post("/login", authHandler.Login)
	})

	return r
}
