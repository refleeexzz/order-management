// Package security reproduces the Java JwtTokenProvider (HS256, sub=email
// only, iat/exp in seconds) and the BCrypt password encoding.
package security

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// TokenProvider issues and validates HS256 JWTs with the exact claim shape
// of the Java provider: sub = email, iat, exp = iat + expiration(ms).
// No role/userId claims — roles are reloaded from the DB per request.
type TokenProvider struct {
	secret       []byte
	expirationMs int64
}

// NewTokenProvider creates a provider from the raw secret string (UTF-8
// bytes, like Keys.hmacShaKeyFor) and an expiration in milliseconds.
func NewTokenProvider(secret string, expirationMs int64) *TokenProvider {
	return &TokenProvider{secret: []byte(secret), expirationMs: expirationMs}
}

// Generate issues a token for the given email (JwtTokenProvider.generateToken).
func (p *TokenProvider) Generate(email string) (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"sub": email,
		"iat": now.Unix(),
		"exp": now.Add(time.Duration(p.expirationMs) * time.Millisecond).Unix(),
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(p.secret)
}

// Validate parses and verifies a token (signature + expiry), returning the
// subject email. Any failure → ok == false (parity with validateToken,
// which swallows every JwtException).
func (p *TokenProvider) Validate(tokenString string) (email string, ok bool) {
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		if _, isHMAC := t.Method.(*jwt.SigningMethodHMAC); !isHMAC {
			return nil, errors.New("unexpected signing method")
		}
		return p.secret, nil
	})
	if err != nil || !token.Valid {
		return "", false
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", false
	}
	sub, err := claims.GetSubject()
	if err != nil || sub == "" {
		return "", false
	}
	return sub, true
}
