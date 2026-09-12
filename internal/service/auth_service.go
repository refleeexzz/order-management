// Package service contains the business services.
package service

import (
	"github.com/refleeexzz/order-management/internal/apperror"
	"github.com/refleeexzz/order-management/internal/domain"
	"github.com/refleeexzz/order-management/internal/dto"
	"github.com/refleeexzz/order-management/internal/repository"
	"github.com/refleeexzz/order-management/internal/security"
)

// AuthService mirrors service/AuthService.
type AuthService struct {
	users  *repository.UserRepository
	tokens *security.TokenProvider
}

func NewAuthService(users *repository.UserRepository, tokens *security.TokenProvider) *AuthService {
	return &AuthService{users: users, tokens: tokens}
}

// Register mirrors AuthService.register:
//   - duplicate email → 409 "User with email '<email>' already exists"
//   - role parsed upper-cased against UserRole, invalid/blank → CUSTOMER
//   - password BCrypt-encoded, user saved with active=true
//   - returns AuthResponse with a fresh JWT
func (s *AuthService) Register(req dto.RegisterRequest) (*dto.AuthResponse, error) {
	exists, err := s.users.ExistsByEmail(req.Email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, apperror.Duplicate("User", "email", req.Email)
	}

	hash, err := security.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	user := &domain.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: hash,
		Role:     domain.ParseUserRole(req.Role),
		Active:   true,
	}
	if err := s.users.Create(user); err != nil {
		return nil, err
	}

	token, err := s.tokens.Generate(user.Email)
	if err != nil {
		return nil, err
	}
	return dto.NewAuthResponse(token, user), nil
}

// Login mirrors AuthService.login: unknown email, inactive user or wrong
// password all surface as 401 "invalid email or password" (parity with the
// BadCredentialsException mapping; the Java DisabledException path is
// explicitly treated as 401 per the spec).
func (s *AuthService) Login(req dto.LoginRequest) (*dto.AuthResponse, error) {
	user, err := s.users.FindByEmail(req.Email)
	if err != nil {
		return nil, apperror.BadCredentials()
	}
	if !user.Active {
		return nil, apperror.BadCredentials()
	}
	if !security.CheckPassword(user.Password, req.Password) {
		return nil, apperror.BadCredentials()
	}

	token, err := s.tokens.Generate(user.Email)
	if err != nil {
		return nil, err
	}
	return dto.NewAuthResponse(token, user), nil
}
