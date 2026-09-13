package dto

import (
	"encoding/json"
	"strings"
	"testing"
	"time"

	"github.com/refleeexzz/order-management/internal/domain"
	"github.com/shopspring/decimal"
)

func strPtr(s string) *string { return &s }

// TestNewProductResponse verifies the flattened, Jackson-shaped mapping:
// category → categoryId/categoryName, sku null when absent, updatedAt null
// until the first update.
func TestNewProductResponse(t *testing.T) {
	created := time.Date(2026, 9, 12, 20, 0, 0, 0, time.Local)
	updated := created.Add(time.Hour)

	tests := []struct {
		name        string
		product     *domain.Product
		wantSKU     interface{} // nil → JSON null
		wantUpdated interface{}
	}{
		{
			name: "sku present, updated",
			product: &domain.Product{
				BaseModel:     domain.BaseModel{ID: 5, CreatedAt: created, UpdatedAt: &updated},
				Name:          "Widget",
				Description:   "desc",
				Price:         decimal.RequireFromString("19.90"),
				StockQuantity: 3,
				SKU:           strPtr("SKU-9"),
				ImageURL:      "http://img",
				Active:        true,
				CategoryID:    2,
				Category:      domain.Category{BaseModel: domain.BaseModel{ID: 2}, Name: "Gadgets"},
			},
			wantSKU:     "SKU-9",
			wantUpdated: "2026-09-12T21:00:00",
		},
		{
			name: "sku null, never updated",
			product: &domain.Product{
				BaseModel:     domain.BaseModel{ID: 6, CreatedAt: created},
				Name:          "Plain",
				Price:         decimal.RequireFromString("1.00"),
				StockQuantity: 0,
				Active:        true,
				CategoryID:    2,
				Category:      domain.Category{BaseModel: domain.BaseModel{ID: 2}, Name: "Gadgets"},
			},
			wantSKU:     nil,
			wantUpdated: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp := NewProductResponse(tt.product)

			if resp.ID != tt.product.ID || resp.Name != tt.product.Name ||
				resp.CategoryID != tt.product.CategoryID || resp.CategoryName != "Gadgets" {
				t.Errorf("flattened mapping wrong: %+v", resp)
			}
			if resp.CreatedAt != "2026-09-12T20:00:00" {
				t.Errorf("createdAt = %q", resp.CreatedAt)
			}
			if tt.wantSKU == nil && resp.SKU != nil {
				t.Errorf("sku should be nil, got %v", *resp.SKU)
			}
			if tt.wantSKU != nil && (resp.SKU == nil || *resp.SKU != tt.wantSKU) {
				t.Errorf("sku = %v, want %v", resp.SKU, tt.wantSKU)
			}
			if tt.wantUpdated == nil && resp.UpdatedAt != nil {
				t.Errorf("updatedAt should be nil, got %v", resp.UpdatedAt)
			}
			if tt.wantUpdated != nil && resp.UpdatedAt != tt.wantUpdated {
				t.Errorf("updatedAt = %v, want %v", resp.UpdatedAt, tt.wantUpdated)
			}

			// JSON shape: sku/updatedAt must serialize as null (no omitempty).
			raw, err := json.Marshal(resp)
			if err != nil {
				t.Fatalf("marshal: %v", err)
			}
			if tt.wantSKU == nil && !strings.Contains(string(raw), `"sku":null`) {
				t.Errorf("expected \"sku\":null in %s", raw)
			}
			if tt.wantUpdated == nil && !strings.Contains(string(raw), `"updatedAt":null`) {
				t.Errorf("expected \"updatedAt\":null in %s", raw)
			}
		})
	}
}

// TestProductResponsePriceScale verifies Jackson/BigDecimal parity: money
// is an unquoted JSON number preserving scale (19.90, not "19.9").
func TestProductResponsePriceScale(t *testing.T) {
	p := &domain.Product{
		Name:       "Widget",
		Price:      decimal.RequireFromString("19.90"),
		CategoryID: 1,
		Category:   domain.Category{BaseModel: domain.BaseModel{ID: 1}, Name: "Gadgets"},
	}
	raw, err := json.Marshal(NewProductResponse(p))
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	if !strings.Contains(string(raw), `"price":19.90`) {
		t.Errorf("expected \"price\":19.90 in %s", raw)
	}
}

// TestNewCategoryResponse verifies field mapping incl. productCount.
func TestNewCategoryResponse(t *testing.T) {
	created := time.Date(2026, 9, 12, 20, 0, 0, 0, time.Local)
	cat := &domain.Category{
		BaseModel:   domain.BaseModel{ID: 4, CreatedAt: created},
		Name:        "Books",
		Description: "reading",
		Active:      false,
	}

	resp := NewCategoryResponse(cat, 12)
	if resp.ID != 4 || resp.Name != "Books" || resp.Description != "reading" ||
		resp.Active != false || resp.ProductCount != 12 || resp.CreatedAt != "2026-09-12T20:00:00" {
		t.Errorf("bad mapping: %+v", resp)
	}

	raw, err := json.Marshal(resp)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	want := `{"id":4,"name":"Books","description":"reading","active":false,"productCount":12,"createdAt":"2026-09-12T20:00:00"}`
	if string(raw) != want {
		t.Errorf("json = %s, want %s", raw, want)
	}
}
