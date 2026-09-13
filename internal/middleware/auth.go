// Package middleware provides the JWT authentication middleware and the
// authorization guards mirroring Spring Security's behavior.
package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/refleeexzz/order-management/internal/apperror"
	"github.com/refleeexzz/order-management/internal/domain"
	"github.com/refleeexzz/order-management/internal/httputil"
	"github.com/refleeexzz/order-management/internal/repository"
	"github.com/refleeexzz/order-management/internal/security"
)

type userContextKey struct{}

// Auth reproduces JwtAuthenticationFilter. It reads the Authorization
// header; only the exact, case-sensitive prefix "Bearer " is accepted. A
// valid token loads the user from the DB by email (roles are therefore
// always current) and stores it in the request context. Invalid, expired
// or unresolvable tokens are silently ignored — the request proceeds
// ANONYMOUS, exactly like the Java filter.
func Auth(users *repository.UserRepository, tokens *security.TokenProvider) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			header := r.Header.Get("Authorization")
			if strings.HasPrefix(header, "Bearer ") {
				token := header[len("Bearer "):]
				if email, ok := tokens.Validate(token); ok {
					if user, err := users.FindByEmail(email); err == nil {
						ctx := context.WithValue(r.Context(), userContextKey{}, user)
						r = r.WithContext(ctx)
					}
				}
			}
			next.ServeHTTP(w, r)
		})
	}
}

// UserFromContext returns the authenticated user stored by Auth, or
// (nil, false) for anonymous requests. Agents 2–4: this is how you get
// the current user (SecurityContextHolder parity).
func UserFromContext(ctx context.Context) (*domain.User, bool) {
	user, ok := ctx.Value(userContextKey{}).(*domain.User)
	return user, ok && user != nil
}

// RequireAuth rejects anonymous requests with 401 (error "Unauthorized",
// message "authentication required") — the pragmatic mapping recommended
// by spec §5.8.
func RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if _, ok := UserFromContext(r.Context()); !ok {
			httputil.WriteError(w, r, apperror.Unauthorized("authentication required"))
			return
		}
		next.ServeHTTP(w, r)
	})
}

// RequireRole allows only authenticated users holding one of the given
// roles. Anonymous → 401 (as RequireAuth); authenticated with the wrong
// role → 403 (error "Forbidden", message "access denied"). Chain it after
// RequireAuth or use it standalone (it implies authentication).
func RequireRole(roles ...domain.UserRole) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			user, ok := UserFromContext(r.Context())
			if !ok {
				httputil.WriteError(w, r, apperror.Unauthorized("authentication required"))
				return
			}
			for _, role := range roles {
				if user.Role == role {
					next.ServeHTTP(w, r)
					return
				}
			}
			httputil.JSON(w, http.StatusForbidden, httputil.ErrorResponse{
				Status:    http.StatusForbidden,
				Error:     "Forbidden",
				Message:   "access denied",
				Path:      r.URL.Path,
				Timestamp: httputil.NowTimestamp(),
			})
		})
	}
}
