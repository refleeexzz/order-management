package security

import (
	"strings"
	"testing"
)

func TestHashAndCheckPassword(t *testing.T) {
	hash, err := HashPassword("admin123")
	if err != nil {
		t.Fatalf("HashPassword: %v", err)
	}

	// must be a Java-compatible $2a$ hash at cost 10 (DefaultCost)
	if !strings.HasPrefix(hash, "$2a$10$") {
		t.Fatalf("hash prefix = %q, want $2a$10$", hash[:7])
	}
	if !CheckPassword(hash, "admin123") {
		t.Fatal("CheckPassword: correct password should verify")
	}
	if CheckPassword(hash, "wrong-password") {
		t.Fatal("CheckPassword: wrong password should not verify")
	}
}

// TestJavaDollar2aHashVerified pins interoperability with hashes produced
// by Spring's BCryptPasswordEncoder (which emits $2a$ hashes).
func TestJavaDollar2aHashVerified(t *testing.T) {
	// $2a$ cost-10 hash of "secret123" — the exact format Spring's
	// BCryptPasswordEncoder produces and verifies.
	const javaHash = "$2a$10$Ds.xrdM6w6F3xq3qb6uC7ejsYZjz8hNM1Xb0fis.R7CN/pGKvQpc."
	if !CheckPassword(javaHash, "secret123") {
		t.Fatal("CheckPassword: Java-produced $2a$ hash should verify")
	}
}
