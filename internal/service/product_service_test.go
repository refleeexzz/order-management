package service

import (
	"testing"

	"github.com/refleeexzz/order-management/internal/domain"
	"github.com/refleeexzz/order-management/internal/dto"
	"github.com/shopspring/decimal"
)

func strPtr(s string) *string                   { return &s }
func intPtr(i int) *int                         { return &i }
func uintPtr(u uint) *uint                      { return &u }
func boolPtr(b bool) *bool                      { return &b }
func decPtr(d decimal.Decimal) *decimal.Decimal { return &d }

func baseProduct() *domain.Product {
	sku := "SKU-1"
	return &domain.Product{
		Name:          "Widget",
		Description:   "a widget",
		Price:         decimal.RequireFromString("19.90"),
		StockQuantity: 7,
		SKU:           &sku,
		ImageURL:      "http://img",
		Active:        true,
		CategoryID:    3,
		Category:      domain.Category{Name: "Gadgets"},
	}
}

// TestApplyProductUpdate mirrors the partial-update semantics of
// ProductService.update: only non-null request fields touch the entity.
func TestApplyProductUpdate(t *testing.T) {
	tests := []struct {
		name       string
		req        dto.UpdateProductRequest
		wantName   string
		wantDesc   string
		wantPrice  string
		wantStock  int
		wantSKU    string
		wantImg    string
		wantActive bool
		wantCat    uint
	}{
		{
			name:       "empty request leaves everything intact",
			req:        dto.UpdateProductRequest{},
			wantName:   "Widget",
			wantDesc:   "a widget",
			wantPrice:  "19.90",
			wantStock:  7,
			wantSKU:    "SKU-1",
			wantImg:    "http://img",
			wantActive: true,
			wantCat:    3,
		},
		{
			name:       "price only (the smoke-test scenario)",
			req:        dto.UpdateProductRequest{Price: decPtr(decimal.RequireFromString("25.50"))},
			wantName:   "Widget",
			wantDesc:   "a widget",
			wantPrice:  "25.50",
			wantStock:  7,
			wantSKU:    "SKU-1",
			wantImg:    "http://img",
			wantActive: true,
			wantCat:    3,
		},
		{
			name: "every field applied",
			req: dto.UpdateProductRequest{
				Name:          strPtr("Gadget"),
				Description:   strPtr(""),
				Price:         decPtr(decimal.RequireFromString("0.01")),
				StockQuantity: intPtr(0),
				ImageURL:      strPtr(""),
				CategoryID:    uintPtr(9),
				Active:        boolPtr(false),
			},
			wantName:   "Gadget",
			wantDesc:   "",
			wantPrice:  "0.01",
			wantStock:  0,
			wantSKU:    "SKU-1", // no sku in UpdateProductRequest — never changes
			wantImg:    "",
			wantActive: false,
			wantCat:    9,
		},
		{
			name:       "empty-string name is applied (@Size allows empty)",
			req:        dto.UpdateProductRequest{Name: strPtr("")},
			wantName:   "",
			wantDesc:   "a widget",
			wantPrice:  "19.90",
			wantStock:  7,
			wantSKU:    "SKU-1",
			wantImg:    "http://img",
			wantActive: true,
			wantCat:    3,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			p := baseProduct()
			ApplyProductUpdate(p, tt.req)

			if p.Name != tt.wantName {
				t.Errorf("name = %q, want %q", p.Name, tt.wantName)
			}
			if p.Description != tt.wantDesc {
				t.Errorf("description = %q, want %q", p.Description, tt.wantDesc)
			}
			if !p.Price.Equal(decimal.RequireFromString(tt.wantPrice)) {
				t.Errorf("price = %s, want %s", p.Price, tt.wantPrice)
			}
			if p.StockQuantity != tt.wantStock {
				t.Errorf("stock = %d, want %d", p.StockQuantity, tt.wantStock)
			}
			if p.SKU == nil || *p.SKU != tt.wantSKU {
				t.Errorf("sku = %v, want %q", p.SKU, tt.wantSKU)
			}
			if p.ImageURL != tt.wantImg {
				t.Errorf("imageUrl = %q, want %q", p.ImageURL, tt.wantImg)
			}
			if p.Active != tt.wantActive {
				t.Errorf("active = %v, want %v", p.Active, tt.wantActive)
			}
			if p.CategoryID != tt.wantCat {
				t.Errorf("categoryId = %d, want %d", p.CategoryID, tt.wantCat)
			}
		})
	}
}
