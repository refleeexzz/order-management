package domain

import (
	"errors"
	"time"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

// BaseModel reproduces BaseEntity: id bigserial, created_at set on insert
// (Hibernate @CreationTimestamp), updated_at set only on UPDATE
// (Hibernate @UpdateTimestamp — stays NULL until the first update, which is
// why GORM's autoUpdateTime is disabled and a BeforeUpdate hook is used
// instead).
type BaseModel struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time  `gorm:"column:created_at;autoCreateTime" json:"createdAt"`
	UpdatedAt *time.Time `gorm:"column:updated_at;autoUpdateTime:false" json:"updatedAt"`
}

// BeforeUpdate sets updated_at on every update, like @UpdateTimestamp.
// NOTE (agents 2-4): this hook only runs for struct-based writes
// (Save / Updates with a struct). Map-based Updates bypass hooks — either
// use struct updates or set UpdatedAt manually.
func (b *BaseModel) BeforeUpdate(_ *gorm.DB) error {
	now := time.Now()
	b.UpdatedAt = &now
	return nil
}

// User mirrors the users table / User entity.
type User struct {
	BaseModel
	Name     string   `gorm:"column:name;type:varchar(100);not null" json:"name"`
	Email    string   `gorm:"column:email;type:varchar(150);not null;uniqueIndex:users_email_key" json:"email"`
	Password string   `gorm:"column:password;type:varchar(255);not null" json:"-"`
	Role     UserRole `gorm:"column:role;type:varchar(20);not null" json:"role"`
	Active   bool     `gorm:"column:active;not null;default:true" json:"active"`
}

func (User) TableName() string { return "users" }

// Address is the @Embeddable Address. In customers it maps to the plain
// columns; in orders it is embedded with the shipping_ prefix.
type Address struct {
	Street       string `gorm:"column:street;type:varchar(200)" json:"street"`
	Number       string `gorm:"column:number;type:varchar(10)" json:"number"`
	Complement   string `gorm:"column:complement;type:varchar(100)" json:"complement"`
	Neighborhood string `gorm:"column:neighborhood;type:varchar(100)" json:"neighborhood"`
	City         string `gorm:"column:city;type:varchar(100)" json:"city"`
	State        string `gorm:"column:state;type:varchar(2)" json:"state"`
	ZipCode      string `gorm:"column:zip_code;type:varchar(9)" json:"zipCode"`
}

// Category mirrors the categories table.
type Category struct {
	BaseModel
	Name        string    `gorm:"column:name;type:varchar(100);not null" json:"name"`
	Description string    `gorm:"column:description;type:varchar(500)" json:"description"`
	Active      bool      `gorm:"column:active;not null;default:true" json:"active"`
	Products    []Product `gorm:"foreignKey:CategoryID" json:"-"`
}

func (Category) TableName() string { return "categories" }

// Product mirrors the products table. SKU is a pointer because the column
// is nullable+unique (multiple NULLs allowed, multiple ” not).
type Product struct {
	BaseModel
	Name          string          `gorm:"column:name;type:varchar(150);not null" json:"name"`
	Description   string          `gorm:"column:description;type:varchar(1000)" json:"description"`
	Price         decimal.Decimal `gorm:"column:price;type:numeric(10,2);not null" json:"price"`
	StockQuantity int             `gorm:"column:stock_quantity;not null;default:0" json:"stockQuantity"`
	SKU           *string         `gorm:"column:sku;type:varchar(50);uniqueIndex:products_sku_key" json:"sku"`
	ImageURL      string          `gorm:"column:image_url;type:varchar(500)" json:"imageUrl"`
	Active        bool            `gorm:"column:active;not null;default:true" json:"active"`
	CategoryID    uint            `gorm:"column:category_id;not null;index:idx_products_category" json:"categoryId"`
	Category      Category        `gorm:"foreignKey:CategoryID" json:"-"`
}

func (Product) TableName() string { return "products" }

// HasStock mirrors Product.hasStock.
func (p *Product) HasStock(quantity int) bool { return p.StockQuantity >= quantity }

// DecreaseStock mirrors Product.decreaseStock; the returned error is a
// plain error (Java IllegalStateException → HTTP 500 via the generic
// handler), NOT an apperror.
func (p *Product) DecreaseStock(quantity int) error {
	if !p.HasStock(quantity) {
		return errors.New("insufficient stock for product: " + p.Name)
	}
	p.StockQuantity -= quantity
	return nil
}

// IncreaseStock mirrors Product.increaseStock.
func (p *Product) IncreaseStock(quantity int) { p.StockQuantity += quantity }

// Customer mirrors the customers table.
type Customer struct {
	BaseModel
	UserID  uint     `gorm:"column:user_id;not null;uniqueIndex:customers_user_id_key;index:idx_customers_user" json:"userId"`
	User    User     `gorm:"foreignKey:UserID" json:"-"`
	CPF     string   `gorm:"column:cpf;type:varchar(14);not null;index:idx_customers_cpf" json:"cpf"`
	Phone   string   `gorm:"column:phone;type:varchar(15)" json:"phone"`
	Address *Address `gorm:"embedded" json:"address"`
	Orders  []Order  `gorm:"foreignKey:CustomerID" json:"-"`
}

func (Customer) TableName() string { return "customers" }

// Order mirrors the orders table.
type Order struct {
	BaseModel
	OrderNumber     string          `gorm:"column:order_number;type:varchar(20);not null;uniqueIndex:orders_order_number_key;index:idx_orders_number" json:"orderNumber"`
	CustomerID      uint            `gorm:"column:customer_id;not null;index:idx_orders_customer" json:"customerId"`
	Customer        Customer        `gorm:"foreignKey:CustomerID" json:"-"`
	Status          OrderStatus     `gorm:"column:status;type:varchar(20);not null;index:idx_orders_status" json:"status"`
	Items           []OrderItem     `gorm:"foreignKey:OrderID;constraint:OnDelete:CASCADE" json:"items"`
	Subtotal        decimal.Decimal `gorm:"column:subtotal;type:numeric(10,2);not null" json:"subtotal"`
	Discount        decimal.Decimal `gorm:"column:discount;type:numeric(10,2)" json:"discount"`
	ShippingCost    decimal.Decimal `gorm:"column:shipping_cost;type:numeric(10,2)" json:"shippingCost"`
	Total           decimal.Decimal `gorm:"column:total;type:numeric(10,2);not null" json:"total"`
	ShippingAddress *Address        `gorm:"embedded;embeddedPrefix:shipping_" json:"shippingAddress"`
	Notes           string          `gorm:"column:notes;type:varchar(500)" json:"notes"`
	PaidAt          *time.Time      `gorm:"column:paid_at" json:"paidAt"`
	ShippedAt       *time.Time      `gorm:"column:shipped_at" json:"shippedAt"`
	DeliveredAt     *time.Time      `gorm:"column:delivered_at" json:"deliveredAt"`
	CancelledAt     *time.Time      `gorm:"column:cancelled_at" json:"cancelledAt"`
	Payment         *Payment        `gorm:"foreignKey:OrderID" json:"-"`
}

func (Order) TableName() string { return "orders" }

// RecalculateTotal mirrors Order.recalculateTotal:
// subtotal = Σ item.total; total = subtotal − discount + shippingCost.
func (o *Order) RecalculateTotal() {
	subtotal := decimal.Zero
	for i := range o.Items {
		subtotal = subtotal.Add(o.Items[i].Total)
	}
	o.Subtotal = subtotal
	o.Total = subtotal.Sub(o.Discount).Add(o.ShippingCost)
}

// AddItem mirrors Order.addItem (appends, sets back-reference, recalculates).
func (o *Order) AddItem(item OrderItem) {
	item.OrderID = o.ID
	o.Items = append(o.Items, item)
	o.RecalculateTotal()
}

// ConfirmPayment mirrors Order.confirmPayment. Errors are plain errors:
// the Java entity throws IllegalStateException which surfaces as HTTP 500.
func (o *Order) ConfirmPayment() error {
	if o.Status != OrderStatusPendingPayment {
		return errors.New("order is not awaiting payment")
	}
	o.Status = OrderStatusPaid
	now := time.Now()
	o.PaidAt = &now
	return nil
}

// Ship mirrors Order.ship (allowed from PAID or PROCESSING).
func (o *Order) Ship() error {
	if o.Status != OrderStatusPaid && o.Status != OrderStatusProcessing {
		return errors.New("order cannot be shipped in current status")
	}
	o.Status = OrderStatusShipped
	now := time.Now()
	o.ShippedAt = &now
	return nil
}

// Deliver mirrors Order.deliver (requires SHIPPED).
func (o *Order) Deliver() error {
	if o.Status != OrderStatusShipped {
		return errors.New("order hasn't been shipped yet")
	}
	o.Status = OrderStatusDelivered
	now := time.Now()
	o.DeliveredAt = &now
	return nil
}

// Cancel mirrors Order.cancel (forbidden only when DELIVERED).
func (o *Order) Cancel() error {
	if o.Status == OrderStatusDelivered {
		return errors.New("order already delivered, cannot be cancelled")
	}
	o.Status = OrderStatusCancelled
	now := time.Now()
	o.CancelledAt = &now
	return nil
}

// OrderItem mirrors the order_items table.
type OrderItem struct {
	BaseModel
	OrderID   uint            `gorm:"column:order_id;not null;index:idx_order_items_order" json:"orderId"`
	Order     Order           `gorm:"foreignKey:OrderID" json:"-"`
	ProductID uint            `gorm:"column:product_id;not null" json:"productId"`
	Product   Product         `gorm:"foreignKey:ProductID" json:"-"`
	Quantity  int             `gorm:"column:quantity;not null" json:"quantity"`
	UnitPrice decimal.Decimal `gorm:"column:unit_price;type:numeric(10,2);not null" json:"unitPrice"`
	Total     decimal.Decimal `gorm:"column:total;type:numeric(10,2);not null" json:"total"`
}

func (OrderItem) TableName() string { return "order_items" }

// CalculateTotal mirrors OrderItem.calculateTotal: total = unitPrice × quantity.
func (i *OrderItem) CalculateTotal() {
	i.Total = i.UnitPrice.Mul(decimal.NewFromInt(int64(i.Quantity)))
}

// BeforeSave reproduces the Java @PrePersist/@PreUpdate calculateTotal hook.
func (i *OrderItem) BeforeSave(_ *gorm.DB) error {
	i.CalculateTotal()
	return nil
}

// Payment mirrors the payments table.
type Payment struct {
	BaseModel
	OrderID       uint            `gorm:"column:order_id;not null;uniqueIndex:payments_order_id_key;index:idx_payments_order" json:"orderId"`
	Order         Order           `gorm:"foreignKey:OrderID" json:"-"`
	Method        PaymentMethod   `gorm:"column:method;type:varchar(20);not null" json:"method"`
	Status        PaymentStatus   `gorm:"column:status;type:varchar(20);not null" json:"status"`
	Amount        decimal.Decimal `gorm:"column:amount;type:numeric(10,2);not null" json:"amount"`
	TransactionID *string         `gorm:"column:transaction_id;type:varchar(100);index:idx_payments_transaction" json:"transactionId"`
	PaidAt        *time.Time      `gorm:"column:paid_at" json:"paidAt"`
	RefundedAt    *time.Time      `gorm:"column:refunded_at" json:"-"`
	Installments  int             `gorm:"column:installments;default:1" json:"installments"`
}

func (Payment) TableName() string { return "payments" }

// Confirm mirrors Payment.confirm.
func (p *Payment) Confirm(transactionID string) {
	p.Status = PaymentStatusPaid
	p.TransactionID = &transactionID
	now := time.Now()
	p.PaidAt = &now
}

// Refund mirrors Payment.refund (requires PAID; plain error → HTTP 500).
func (p *Payment) Refund() error {
	if p.Status != PaymentStatusPaid {
		return errors.New("payment cannot be refunded")
	}
	p.Status = PaymentStatusRefunded
	now := time.Now()
	p.RefundedAt = &now
	return nil
}
