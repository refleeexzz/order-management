package security

import (
	"strings"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const testSecret = "minha-chave-secreta-super-segura-com-pelo-menos-256-bits-para-hs256"

func TestTokenRoundtrip(t *testing.T) {
	p := NewTokenProvider(testSecret, 86400000)

	token, err := p.Generate("user@example.com")
	if err != nil {
		t.Fatalf("Generate: %v", err)
	}
	email, ok := p.Validate(token)
	if !ok {
		t.Fatal("Validate: token should be valid")
	}
	if email != "user@example.com" {
		t.Fatalf("email = %q, want user@example.com", email)
	}
}

func TestTokenClaimsShape(t *testing.T) {
	p := NewTokenProvider(testSecret, 86400000)
	token, err := p.Generate("user@example.com")
	if err != nil {
		t.Fatalf("Generate: %v", err)
	}

	// parse without verifying to inspect the claims
	parsed, _, err := new(jwt.Parser).ParseUnverified(token, jwt.MapClaims{})
	if err != nil {
		t.Fatalf("ParseUnverified: %v", err)
	}
	claims := parsed.Claims.(jwt.MapClaims)

	for _, key := range []string{"sub", "iat", "exp"} {
		if _, ok := claims[key]; !ok {
			t.Fatalf("missing claim %q in %v", key, claims)
		}
	}
	// parity: no role/userId claims
	for _, key := range []string{"role", "userId", "authorities"} {
		if _, ok := claims[key]; ok {
			t.Fatalf("unexpected claim %q present", key)
		}
	}
	// exp - iat must equal the expiration in seconds
	iat, _ := claims["iat"].(float64)
	exp, _ := claims["exp"].(float64)
	if got := exp - iat; got != 86400 {
		t.Fatalf("exp-iat = %v, want 86400", got)
	}
}

func TestValidateRejectsBadTokens(t *testing.T) {
	p := NewTokenProvider(testSecret, 86400000)
	valid, err := p.Generate("user@example.com")
	if err != nil {
		t.Fatalf("Generate: %v", err)
	}

	// token signed with a different secret
	other := NewTokenProvider("another-secret-key-that-is-long-enough-for-hs256-too", 86400000)
	wrongKey, err := other.Generate("user@example.com")
	if err != nil {
		t.Fatalf("Generate: %v", err)
	}

	// tampered payload: flip a character in the signature segment
	parts := strings.Split(valid, ".")
	sig := []byte(parts[2])
	if sig[0] == 'A' {
		sig[0] = 'B'
	} else {
		sig[0] = 'A'
	}
	tampered := parts[0] + "." + parts[1] + "." + string(sig)

	// expired token
	expired := NewTokenProvider(testSecret, -1000)
	expiredToken, err := expired.Generate("user@example.com")
	if err != nil {
		t.Fatalf("Generate: %v", err)
	}
	time.Sleep(10 * time.Millisecond)

	cases := map[string]string{
		"wrong signing key": wrongKey,
		"tampered":          tampered,
		"expired":           expiredToken,
		"garbage":           "not-a-jwt",
		"empty":             "",
	}
	for name, token := range cases {
		t.Run(name, func(t *testing.T) {
			if _, ok := p.Validate(token); ok {
				t.Fatalf("token should be rejected")
			}
		})
	}
}
