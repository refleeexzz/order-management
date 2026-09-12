package security

import "golang.org/x/crypto/bcrypt"

// HashPassword encodes a plain-text password with BCrypt at the default
// cost (10), producing $2a$ hashes fully compatible with the Java
// BCryptPasswordEncoder.
func HashPassword(plain string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(plain), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

// CheckPassword reports whether plain matches the given BCrypt hash
// ($2a$ hashes produced by Java verify correctly).
func CheckPassword(hash, plain string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain)) == nil
}
