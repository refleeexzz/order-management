package dto

import (
	"github.com/refleeexzz/order-management/internal/domain"
	"github.com/refleeexzz/order-management/internal/httputil"
	"github.com/shopspring/decimal"
)

// CreateProductRequest mirrors dto/product/CreateProductRequest. Price,
// StockQuantity and CategoryID are pointers so `required` can reproduce
// @NotNull (absent JSON field → nil → "… is required"); SKU is a pointer
// because the Java DTO allows a null sku (column nullable+unique).
type CreateProductRequest struct {
	Name          string           `json:"name" validate:"notblank,max=150"`
	Description   string           `json:"description" validate:"max=1000"`
	Price         *decimal.Decimal `json:"price" validate:"required,decmin=0.01"`
	StockQuantity *int             `json:"stockQuantity" validate:"required,min=0"`
	SKU           *string          `json:"sku" validate:"omitempty,max=50"`
	ImageURL      string           `json:"imageUrl" validate:"max=500"`
	CategoryID    *uint            `json:"categoryId" validate:"required"`
}

// CreateProductMessages maps "<field>.<tag>" to the exact Jakarta messages.
var CreateProductMessages = map[string]string{
	"name.notblank":          "product name is required",
	"name.max":               "name cannot exceed 150 characters",
	"description.max":        "description cannot exceed 1000 characters",
	"price.required":         "price is required",
	"price.decmin":           "price must be greater than zero",
	"stockQuantity.required": "stock quantity is required",
	"stockQuantity.min":      "stock quantity cannot be negative",
	"sku.max":                "sku cannot exceed 50 characters",
	"imageUrl.max":           "image url cannot exceed 500 characters",
	"categoryId.required":    "category id is required",
}

// UpdateProductRequest mirrors dto/product/UpdateProductRequest — a partial
// update: every field is a pointer and only non-null JSON fields are
// applied. NOTE: there is intentionally NO sku field (Java parity — sku
// cannot be updated; a sku key in the JSON body is silently ignored).
type UpdateProductRequest struct {
	Name          *string          `json:"name" validate:"omitempty,max=150"`
	Description   *string          `json:"description" validate:"omitempty,max=1000"`
	Price         *decimal.Decimal `json:"price" validate:"omitempty,decmin=0.01"`
	StockQuantity *int             `json:"stockQuantity" validate:"omitempty,min=0"`
	ImageURL      *string          `json:"imageUrl" validate:"omitempty,max=500"`
	CategoryID    *uint            `json:"categoryId"` // no validation in Java
	Active        *bool            `json:"active"`
}

// UpdateProductMessages maps "<field>.<tag>" to the exact Jakarta messages.
var UpdateProductMessages = map[string]string{
	"name.max":          "name cannot exceed 150 characters",
	"description.max":   "description cannot exceed 1000 characters",
	"price.decmin":      "price must be greater than zero",
	"stockQuantity.min": "stock quantity cannot be negative",
	"imageUrl.max":      "image url cannot exceed 500 characters",
}

// ProductResponse mirrors dto/product/ProductResponse — the category is
// FLATTENED to categoryId/categoryName. `sku` stays a *string with no
// omitempty so an absent sku serializes as JSON null (Jackson parity).
// Optional unset strings (description, imageUrl) follow the agent-1
// convention and serialize as "".
type ProductResponse struct {
	ID            uint           `json:"id"`
	Name          string         `json:"name"`
	Description   string         `json:"description"`
	Price         httputil.Money `json:"price"`
	StockQuantity int            `json:"stockQuantity"`
	SKU           *string        `json:"sku"`
	ImageURL      string         `json:"imageUrl"`
	Active        bool           `json:"active"`
	CategoryID    uint           `json:"categoryId"`
	CategoryName  string         `json:"categoryName"`
	CreatedAt     string         `json:"createdAt"`
	UpdatedAt     interface{}    `json:"updatedAt"` // nil → JSON null (updated_at is null until first update)
}

// NewProductResponse mirrors ProductResponse.fromEntity(product); the
// product's Category association must be loaded.
func NewProductResponse(product *domain.Product) *ProductResponse {
	return &ProductResponse{
		ID:            product.ID,
		Name:          product.Name,
		Description:   product.Description,
		Price:         httputil.NewMoney(product.Price),
		StockQuantity: product.StockQuantity,
		SKU:           product.SKU,
		ImageURL:      product.ImageURL,
		Active:        product.Active,
		CategoryID:    product.CategoryID,
		CategoryName:  product.Category.Name,
		CreatedAt:     httputil.LocalTime(product.CreatedAt),
		UpdatedAt:     httputil.LocalTimePtr(product.UpdatedAt),
	}
}
