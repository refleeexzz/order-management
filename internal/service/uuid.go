package service

import (
	"crypto/rand"
	"fmt"
)

// newUUIDString generates a random UUID in the canonical 8-4-4-4-12
// lowercase-hex format of java.util.UUID.randomUUID().toString(). Order
// numbers and payment transaction ids take the same substrings the Java
// code takes (0-5 and 0-12 respectively, the latter including the first
// dash).
func newUUIDString() string {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		// crypto/rand never fails on supported platforms; fall back to a
		// zero UUID rather than panic (Java would throw inside the UUID
		// call all the same).
		return "00000000-0000-4000-8000-000000000000"
	}
	b[6] = (b[6] & 0x0f) | 0x40 // version 4
	b[8] = (b[8] & 0x3f) | 0x80 // variant 10
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
}
