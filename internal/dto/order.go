package dto

import (
	"github.com/refleeexzz/order-management/internal/domain"
	"github.com/refleeexzz/order-management/internal/httputil"
)

// CreateOrderRequest mirrors dto/order/CreateOrderRequest. Items uses
// required+min=1 to reproduce @NotEmpty (null AND empty both fail with the
// same message); dive validates each element. CouponCode is a pointer so
// the service can tell "absent" (Java null → coupon logic skipped) from
// present.
type CreateOrderRequest struct {
	Items           []OrderItemRequest `json:"items" validate:"required,min=1,dive"`
	ShippingAddress *AddressDto        `json:"shippingAddress"`
	Notes           string             `json:"notes"`
	CouponCode      *string            `json:"couponCode"`
}

// CreateOrderMessages maps "<jsonField>.<tag>" to the exact Jakarta
// messages (item element fields surface by leaf json name via dive).
var CreateOrderMessages = func() map[string]string {
	m := map[string]string{
		"items.required":     "order must have at least one item",
		"items.min":          "order must have at least one item",
		"productId.required": "product id is required",
		"quantity.required":  "quantity is required",
		"quantity.min":       "quantity must be at least 1",
	}
	for k, v := range AddressMessages {
		m[k] = v
	}
	return m
}()

// OrderItemRequest mirrors dto/order/OrderItemRequest. Pointers reproduce
// @NotNull (absent → nil → "… is required").
type OrderItemRequest struct {
	ProductID *uint `json:"productId" validate:"required"`
	Quantity  *int  `json:"quantity" validate:"required,min=1"`
}

// UpdateOrderStatusRequest mirrors dto/order/UpdateOrderStatusRequest.
// Status is bound as a plain string (required → "status is required"); the
// handler then parses it against OrderStatus (invalid enum string → 400,
// like Jackson's deserialization failure). Reason is accepted and IGNORED,
// exactly like the Java service.
type UpdateOrderStatusRequest struct {
	Status string `json:"status" validate:"required"`
	Reason string `json:"reason"`
}

// UpdateOrderStatusMessages maps "<jsonField>.<tag>" to the Jakarta messages.
var UpdateOrderStatusMessages = map[string]string{
	"status.required": "status is required",
}

// OrderResponse mirrors dto/order/OrderResponse. All money fields go
// through httputil.Money (BigDecimal parity). Optional timestamps are
// interface{} so unset → JSON null.
type OrderResponse struct {
	ID              uint                `json:"id"`
	OrderNumber     string              `json:"orderNumber"`
	CustomerID      uint                `json:"customerId"`
	CustomerName    string              `json:"customerName"`
	Status          domain.OrderStatus  `json:"status"`
	Items           []OrderItemResponse `json:"items"`
	Subtotal        httputil.Money      `json:"subtotal"`
	Discount        httputil.Money      `json:"discount"`
	ShippingCost    httputil.Money      `json:"shippingCost"`
	Total           httputil.Money      `json:"total"`
	ShippingAddress *AddressDto         `json:"shippingAddress"`
	Notes           string              `json:"notes"`
	PaidAt          interface{}         `json:"paidAt"`
	ShippedAt       interface{}         `json:"shippedAt"`
	DeliveredAt     interface{}         `json:"deliveredAt"`
	CancelledAt     interface{}         `json:"cancelledAt"`
	CreatedAt       string              `json:"createdAt"`
}

// OrderItemResponse mirrors dto/order/OrderItemResponse. ProductSKU stays a
// *string so an absent sku serializes as null (products.sku is nullable).
type OrderItemResponse struct {
	ID          uint           `json:"id"`
	ProductID   uint           `json:"productId"`
	ProductName string         `json:"productName"`
	ProductSKU  *string        `json:"productSku"`
	Quantity    int            `json:"quantity"`
	UnitPrice   httputil.Money `json:"unitPrice"`
	Total       httputil.Money `json:"total"`
}

// NewOrderResponse mirrors OrderResponse.fromEntity(order). Requires the
// order's Items (+ each item's Product) and Customer (+ its User) loaded.
// Items normalizes to [] (never null), like the JPA collection.
func NewOrderResponse(order *domain.Order) *OrderResponse {
	items := make([]OrderItemResponse, 0, len(order.Items))
	for i := range order.Items {
		item := &order.Items[i]
		items = append(items, OrderItemResponse{
			ID:          item.ID,
			ProductID:   item.ProductID,
			ProductName: item.Product.Name,
			ProductSKU:  item.Product.SKU,
			Quantity:    item.Quantity,
			UnitPrice:   httputil.NewMoney(item.UnitPrice),
			Total:       httputil.NewMoney(item.Total),
		})
	}
	return &OrderResponse{
		ID:              order.ID,
		OrderNumber:     order.OrderNumber,
		CustomerID:      order.CustomerID,
		CustomerName:    order.Customer.User.Name,
		Status:          order.Status,
		Items:           items,
		Subtotal:        httputil.NewMoney(order.Subtotal),
		Discount:        httputil.NewMoney(order.Discount),
		ShippingCost:    httputil.NewMoney(order.ShippingCost),
		Total:           httputil.NewMoney(order.Total),
		ShippingAddress: AddressDtoFrom(order.ShippingAddress),
		Notes:           order.Notes,
		PaidAt:          httputil.LocalTimePtr(order.PaidAt),
		ShippedAt:       httputil.LocalTimePtr(order.ShippedAt),
		DeliveredAt:     httputil.LocalTimePtr(order.DeliveredAt),
		CancelledAt:     httputil.LocalTimePtr(order.CancelledAt),
		CreatedAt:       httputil.LocalTime(order.CreatedAt),
	}
}

// OrderStats mirrors OrderService.OrderStats (counts per status).
type OrderStats struct {
	PendingPayment int64 `json:"pendingPayment"`
	Paid           int64 `json:"paid"`
	Processing     int64 `json:"processing"`
	Shipped        int64 `json:"shipped"`
	Delivered      int64 `json:"delivered"`
	Cancelled      int64 `json:"cancelled"`
}
