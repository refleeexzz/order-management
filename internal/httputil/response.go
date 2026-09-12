// Package httputil provides JSON response helpers and the ErrorResponse
// machinery reproducing the Spring GlobalExceptionHandler output.
package httputil

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/refleeexzz/order-management/internal/apperror"
)

// FieldError mirrors ErrorResponse.FieldError.
type FieldError struct {
	Field         string      `json:"field"`
	Message       string      `json:"message"`
	RejectedValue interface{} `json:"rejectedValue"`
}

// ErrorResponse mirrors com.ordermanagement.exception.ErrorResponse.
// FieldErrors is serialized as null unless it is a validation error
// (Jackson parity — no omitempty on purpose).
type ErrorResponse struct {
	Status      int          `json:"status"`
	Error       string       `json:"error"`
	Message     string       `json:"message"`
	Path        string       `json:"path"`
	Timestamp   string       `json:"timestamp"`
	FieldErrors []FieldError `json:"fieldErrors"`
}

// JSON writes v as JSON with the given status code.
func JSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

// NowTimestamp formats the current local time like Jackson serializes
// LocalDateTime.now(): ISO local datetime with milliseconds.
func NowTimestamp() string {
	return time.Now().Format("2006-01-02T15:04:05.000")
}

// LocalTime formats t as an ISO local datetime (no timezone), like Jackson
// serializes LocalDateTime fields: fraction omitted when zero. Use it in
// DTOs for createdAt/updatedAt/paidAt/... parity.
func LocalTime(t time.Time) string {
	if t.Nanosecond() == 0 {
		return t.Format("2006-01-02T15:04:05")
	}
	return t.Format("2006-01-02T15:04:05.000")
}

// LocalTimePtr formats an optional timestamp; nil stays nil (JSON null).
func LocalTimePtr(t *time.Time) interface{} {
	if t == nil {
		return nil
	}
	return LocalTime(*t)
}

// WriteError maps an error to the ErrorResponse JSON of the Java
// GlobalExceptionHandler:
//
//	apperror NotFound            → 404 "Not Found"            (err message)
//	apperror Business            → 400 "Bad Request"          (err message)
//	apperror Duplicate           → 409 "Conflict"             (err message)
//	apperror InsufficientStock   → 409 "Conflict"             (err message)
//	apperror Unauthorized        → 401 "Unauthorized"         (err message)
//	anything else                → 500 "Internal Server Error" ("an unexpected error occurred")
func WriteError(w http.ResponseWriter, r *http.Request, err error) {
	var appErr *apperror.Error
	if errors.As(err, &appErr) {
		switch appErr.Kind {
		case apperror.KindNotFound:
			writeAppError(w, r, http.StatusNotFound, "Not Found", appErr.Message)
		case apperror.KindBusiness:
			writeAppError(w, r, http.StatusBadRequest, "Bad Request", appErr.Message)
		case apperror.KindDuplicate, apperror.KindInsufficientStock:
			writeAppError(w, r, http.StatusConflict, "Conflict", appErr.Message)
		case apperror.KindUnauthorized:
			writeAppError(w, r, http.StatusUnauthorized, "Unauthorized", appErr.Message)
		default:
			writeAppError(w, r, http.StatusInternalServerError, "Internal Server Error", "an unexpected error occurred")
		}
		return
	}
	// Generic handler: entity guard violations (Java IllegalStateException)
	// and any unknown error land here, exactly like @ExceptionHandler(Exception.class).
	writeAppError(w, r, http.StatusInternalServerError, "Internal Server Error", "an unexpected error occurred")
}

func writeAppError(w http.ResponseWriter, r *http.Request, status int, errorText, message string) {
	JSON(w, status, ErrorResponse{
		Status:    status,
		Error:     errorText,
		Message:   message,
		Path:      r.URL.Path,
		Timestamp: NowTimestamp(),
	})
}

// WriteValidationError writes the 400 "Validation Failed" response with the
// given field errors (MethodArgumentNotValidException parity).
func WriteValidationError(w http.ResponseWriter, r *http.Request, fieldErrors []FieldError) {
	JSON(w, http.StatusBadRequest, ErrorResponse{
		Status:      http.StatusBadRequest,
		Error:       "Validation Failed",
		Message:     "one or more fields have validation errors",
		Path:        r.URL.Path,
		Timestamp:   NowTimestamp(),
		FieldErrors: fieldErrors,
	})
}
