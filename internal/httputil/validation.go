package httputil

import (
	"encoding/json"
	"net/http"
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/shopspring/decimal"
)

// validate is the shared validator. Field names come from the `json` tag
// (Java field names == JSON names in this codebase) and a custom
// `notblank` tag reproduces Jakarta @NotBlank (rejects "", whitespace-only
// and missing/zero values — `required` alone accepts " ").
var validate = func() *validator.Validate {
	v := validator.New()
	v.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return ""
		}
		return name
	})
	_ = v.RegisterValidation("notblank", func(fl validator.FieldLevel) bool {
		return strings.TrimSpace(fl.Field().String()) != ""
	})
	// decmin reproduces Jakarta @DecimalMin (inclusive): the field must be a
	// decimal.Decimal (or *decimal.Decimal) with value >= the tag parameter.
	// A nil pointer passes (pair it with `required` to reject nil, like
	// @NotNull + @DecimalMin).
	_ = v.RegisterValidation("decmin", func(fl validator.FieldLevel) bool {
		min, err := decimal.NewFromString(fl.Param())
		if err != nil {
			return false
		}
		field := fl.Field()
		if field.Kind() == reflect.Ptr {
			if field.IsNil() {
				return true
			}
			field = field.Elem()
		}
		d, ok := field.Interface().(decimal.Decimal)
		if !ok {
			return false
		}
		return d.GreaterThanOrEqual(min)
	})
	return v
}()

// Validate runs the shared validator against s and converts failures to
// FieldErrors. messages maps "<jsonField>.<tag>" to the EXACT Jakarta
// message (e.g. "name.notblank" → "name is required"); tags without an
// entry fall back to a generic message. Errors preserve struct field
// order, like Spring's BindingResult.
func Validate(s interface{}, messages map[string]string) []FieldError {
	err := validate.Struct(s)
	if err == nil {
		return nil
	}
	var out []FieldError
	for _, fe := range err.(validator.ValidationErrors) {
		msg, ok := messages[fe.Field()+"."+fe.Tag()]
		if !ok {
			msg = defaultMessage(fe)
		}
		out = append(out, FieldError{
			Field:         fe.Field(),
			Message:       msg,
			RejectedValue: normalizeRejectedValue(fe.Value()),
		})
	}
	return out
}

// Bind decodes the JSON request body into dst and validates it. On failure
// it writes the appropriate ErrorResponse and returns false — handlers
// should just `return`.
//
//	malformed/absent body → 400 "Bad Request" / "malformed request body"
//	validation errors     → 400 "Validation Failed" + fieldErrors
func Bind(w http.ResponseWriter, r *http.Request, dst interface{}, messages map[string]string) bool {
	dec := json.NewDecoder(r.Body)
	if err := dec.Decode(dst); err != nil {
		JSON(w, http.StatusBadRequest, ErrorResponse{
			Status:    http.StatusBadRequest,
			Error:     "Bad Request",
			Message:   "malformed request body",
			Path:      r.URL.Path,
			Timestamp: NowTimestamp(),
		})
		return false
	}
	if fieldErrors := Validate(dst, messages); len(fieldErrors) > 0 {
		WriteValidationError(w, r, fieldErrors)
		return false
	}
	return true
}

func defaultMessage(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required", "notblank":
		return fe.Field() + " is required"
	case "email":
		return fe.Field() + " must be valid"
	case "min":
		return fe.Field() + " must be at least " + fe.Param()
	case "max":
		return fe.Field() + " must be at most " + fe.Param()
	default:
		return fe.Field() + " is invalid"
	}
}
