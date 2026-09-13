package httputil

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/refleeexzz/order-management/internal/apperror"
)

func writeErrorRequest(err error) (*httptest.ResponseRecorder, ErrorResponse) {
	req := httptest.NewRequest(http.MethodGet, "/api/test", nil)
	rec := httptest.NewRecorder()
	WriteError(rec, req, err)
	var body ErrorResponse
	_ = json.Unmarshal(rec.Body.Bytes(), &body)
	return rec, body
}

func TestWriteErrorMapping(t *testing.T) {
	cases := []struct {
		name        string
		err         error
		wantStatus  int
		wantError   string
		wantMessage string
	}{
		{"not found by id", apperror.NotFound("Product", 42), 404, "Not Found", "Product not found with id: 42"},
		{"not found by field", apperror.NotFoundByField("Product", "sku", "ABC"), 404, "Not Found", "Product not found with sku: ABC"},
		{"not found raw message", apperror.NotFoundMsg("Customer profile not found for current user"), 404, "Not Found", "Customer profile not found for current user"},
		{"business", apperror.Business("order is not awaiting payment"), 400, "Bad Request", "order is not awaiting payment"},
		{"duplicate", apperror.Duplicate("User", "email", "a@b.com"), 409, "Conflict", "User with email 'a@b.com' already exists"},
		{"duplicate raw message", apperror.DuplicateMsg("Customer profile already exists for this user"), 409, "Conflict", "Customer profile already exists for this user"},
		{"insufficient stock", apperror.InsufficientStock(7, 5, 2), 409, "Conflict", "insufficient stock for product 7: requested 5 but only 2 available"},
		{"bad credentials", apperror.BadCredentials(), 401, "Unauthorized", "invalid email or password"},
		{"unauthorized custom", apperror.Unauthorized("authentication required"), 401, "Unauthorized", "authentication required"},
		{"wrapped app error keeps mapping", wrapErr(apperror.Business("invalid status transition")), 400, "Bad Request", "invalid status transition"},
		{"entity guard violation → 500", errors.New("order hasn't been shipped yet"), 500, "Internal Server Error", "an unexpected error occurred"},
		{"unknown error → 500", errors.New("boom"), 500, "Internal Server Error", "an unexpected error occurred"},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			rec, body := writeErrorRequest(c.err)
			if rec.Code != c.wantStatus {
				t.Fatalf("status = %d, want %d", rec.Code, c.wantStatus)
			}
			if body.Error != c.wantError {
				t.Errorf("error = %q, want %q", body.Error, c.wantError)
			}
			if body.Message != c.wantMessage {
				t.Errorf("message = %q, want %q", body.Message, c.wantMessage)
			}
			if body.Path != "/api/test" {
				t.Errorf("path = %q, want /api/test", body.Path)
			}
			if body.Timestamp == "" {
				t.Error("timestamp must be set")
			}
			// fieldErrors must be serialized as null, never omitted
			if !strings.Contains(rec.Body.String(), `"fieldErrors":null`) {
				t.Errorf("body must contain \"fieldErrors\":null, got %s", rec.Body.String())
			}
		})
	}
}

type wrapErrT struct{ inner error }

func (w wrapErrT) Error() string { return "wrapped: " + w.inner.Error() }
func (w wrapErrT) Unwrap() error { return w.inner }
func wrapErr(e error) error      { return wrapErrT{e} }

func TestBindValidationErrors(t *testing.T) {
	type registerRequest struct {
		Name  string `json:"name" validate:"notblank,min=2,max=100"`
		Email string `json:"email" validate:"notblank,omitempty,email"`
	}
	messages := map[string]string{
		"name.notblank":  "name is required",
		"name.min":       "name must be between 2 and 100 characters",
		"email.notblank": "email is required",
		"email.email":    "email must be valid",
	}

	cases := []struct {
		name         string
		body         string
		wantStatus   int
		wantError    string
		wantFields   []string
		wantMessages []string
	}{
		{
			name:         "one-char name",
			body:         `{"name":"A","email":"a@b.com"}`,
			wantStatus:   400,
			wantError:    "Validation Failed",
			wantFields:   []string{"name"},
			wantMessages: []string{"name must be between 2 and 100 characters"},
		},
		{
			name:         "blank name",
			body:         `{"name":"   ","email":"a@b.com"}`,
			wantStatus:   400,
			wantError:    "Validation Failed",
			wantFields:   []string{"name"},
			wantMessages: []string{"name is required"},
		},
		{
			name:         "invalid email",
			body:         `{"name":"John","email":"not-an-email"}`,
			wantStatus:   400,
			wantError:    "Validation Failed",
			wantFields:   []string{"email"},
			wantMessages: []string{"email must be valid"},
		},
		{
			name:         "missing fields report both",
			body:         `{}`,
			wantStatus:   400,
			wantError:    "Validation Failed",
			wantFields:   []string{"name", "email"},
			wantMessages: []string{"name is required", "email is required"},
		},
		{
			name:       "malformed body",
			body:       `{oops`,
			wantStatus: 400,
			wantError:  "Bad Request",
		},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/api/auth/register", strings.NewReader(c.body))
			rec := httptest.NewRecorder()
			var dst registerRequest
			if Bind(rec, req, &dst, messages) {
				t.Fatal("Bind should have failed")
			}
			if rec.Code != c.wantStatus {
				t.Fatalf("status = %d, want %d", rec.Code, c.wantStatus)
			}
			var body ErrorResponse
			if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
				t.Fatalf("unmarshal: %v", err)
			}
			if body.Error != c.wantError {
				t.Fatalf("error = %q, want %q", body.Error, c.wantError)
			}
			for i, field := range c.wantFields {
				if len(body.FieldErrors) <= i {
					t.Fatalf("missing fieldError %d in %+v", i, body.FieldErrors)
				}
				if body.FieldErrors[i].Field != field {
					t.Errorf("fieldErrors[%d].field = %q, want %q", i, body.FieldErrors[i].Field, field)
				}
				if body.FieldErrors[i].Message != c.wantMessages[i] {
					t.Errorf("fieldErrors[%d].message = %q, want %q", i, body.FieldErrors[i].Message, c.wantMessages[i])
				}
			}
		})
	}
}

func TestBindValidBody(t *testing.T) {
	type req struct {
		Name string `json:"name" validate:"notblank,min=2"`
	}
	r := httptest.NewRequest(http.MethodPost, "/x", strings.NewReader(`{"name":"John"}`))
	rec := httptest.NewRecorder()
	var dst req
	if !Bind(rec, r, &dst, nil) {
		t.Fatal("Bind should succeed")
	}
	if dst.Name != "John" {
		t.Fatalf("Name = %q", dst.Name)
	}
}
