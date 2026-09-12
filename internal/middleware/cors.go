package middleware

import (
	"net/http"

	"github.com/go-chi/cors"
)

// CORS reproduces the exact SecurityConfig.corsConfigurationSource()
// settings (spec §2.5).
func CORS(next http.Handler) http.Handler {
	return cors.Handler(cors.Options{
		AllowedOrigins: []string{
			"http://localhost:5173",
			"http://localhost:5174",
			"http://localhost:3000",
			"https://order-management-three.vercel.app",
			"https://order-management-iota-eight.vercel.app",
		},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type", "X-Requested-With"},
		AllowCredentials: true,
	})(next)
}
