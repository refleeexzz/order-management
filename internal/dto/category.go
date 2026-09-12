package dto

import (
	"github.com/refleeexzz/order-management/internal/domain"
	"github.com/refleeexzz/order-management/internal/httputil"
)

// CreateCategoryRequest mirrors dto/category/CreateCategoryRequest — used
// for both create and update (the Java controller reuses the same DTO).
type CreateCategoryRequest struct {
	Name        string `json:"name" validate:"notblank,max=100"`
	Description string `json:"description" validate:"max=500"`
}

// CreateCategoryMessages maps "<field>.<tag>" to the exact Jakarta messages.
var CreateCategoryMessages = map[string]string{
	"name.notblank":   "category name is required",
	"name.max":        "name cannot exceed 100 characters",
	"description.max": "description cannot exceed 500 characters",
}

// CategoryResponse mirrors dto/category/CategoryResponse. Field order
// matches the Java declaration order. `productCount` counts ALL products of
// the category (including inactive), like category.getProducts().size().
type CategoryResponse struct {
	ID           uint   `json:"id"`
	Name         string `json:"name"`
	Description  string `json:"description"`
	Active       bool   `json:"active"`
	ProductCount int    `json:"productCount"`
	CreatedAt    string `json:"createdAt"`
}

// NewCategoryResponse mirrors CategoryResponse.fromEntity(category).
func NewCategoryResponse(category *domain.Category, productCount int) *CategoryResponse {
	return &CategoryResponse{
		ID:           category.ID,
		Name:         category.Name,
		Description:  category.Description,
		Active:       category.Active,
		ProductCount: productCount,
		CreatedAt:    httputil.LocalTime(category.CreatedAt),
	}
}
