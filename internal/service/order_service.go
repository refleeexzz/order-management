package service

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/refleeexzz/order-management/internal/apperror"
	"github.com/refleeexzz/order-management/internal/domain"
	"github.com/refleeexzz/order-management/internal/dto"
	"github.com/refleeexzz/order-management/internal/repository"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

// OrderService mirrors service/OrderService. Every mutating method runs in
// ONE gorm transaction (Java @Transactional parity — stock changes and
// order writes commit or roll back together).
type OrderService struct {
	db         *gorm.DB
	orders     *repository.OrderRepository
	customers  *CustomerService
	products   *ProductService
	productRep *repository.ProductRepository
}

func NewOrderService(db *gorm.DB, orders *repository.OrderRepository, productRep *repository.ProductRepository, customers *CustomerService, products *ProductService) *OrderService {
	return &OrderService{db: db, orders: orders, productRep: productRep, customers: customers, products: products}
}

// flatShippingCost mirrors OrderService.calculateShippingCost: a hardcoded
// new BigDecimal("15.00") (scale 2 preserved for Jackson parity).
var flatShippingCost = decimal.RequireFromString("15.00")

// GenerateOrderNumber mirrors generateOrderNumber:
// "ORD-" + yyyyMMdd + "-" + first 5 chars of a random UUID, upper-cased
// (e.g. ORD-20260912-A1B2C). The first 5 UUID chars never contain a dash.
func GenerateOrderNumber() string {
	datePart := time.Now().Format("20060102")
	uniquePart := strings.ToUpper(newUUIDString()[:5])
	return "ORD-" + datePart + "-" + uniquePart
}

// ApplyCoupon mirrors applyCoupon: "FIRST10" (case-insensitive) → 10% of
// the subtotal; any other code → ZERO discount (no error). The Java code
// keeps the unrounded scale-4 product in memory (DB rounds to 2dp on
// save); the rewrite rounds HALF-UP to 2dp immediately so the create
// response matches what every later read returns (PostgreSQL numeric(10,2)
// also rounds half-up on store). Documented deviation: for subtotals whose
// 10% has a third decimal (e.g. 25.55 → 2.555) the Java create response
// serializes discount 2.5550 while the rewrite returns the stored 2.56.
func ApplyCoupon(couponCode string, subtotal decimal.Decimal) decimal.Decimal {
	if strings.EqualFold(couponCode, "FIRST10") {
		// Round normalizes trailing zeros away (10.0000 → 10); re-parsing
		// the 2dp fixed string pins the scale to exactly 2, matching the
		// numeric(10,2) value every later DB read returns.
		return decimal.RequireFromString(
			subtotal.Mul(decimal.RequireFromString("0.10")).Round(2).StringFixed(2))
	}
	return decimal.Zero
}

// CancelNote mirrors the note append in OrderService.cancel:
// existing + " | cancelled: " + reason, or "cancelled: " + reason when
// there are no notes. Java concatenates a null reason as the literal string
// "null" (absent ?reason= param) — the rewrite treats absent/empty as
// "null" the same way (deviation: an explicitly EMPTY ?reason= produces
// "cancelled: " in Java but "cancelled: null" here).
func CancelNote(existingNotes, reason string) string {
	if reason == "" {
		reason = "null"
	}
	if existingNotes != "" {
		return existingNotes + " | cancelled: " + reason
	}
	return "cancelled: " + reason
}

// Create mirrors OrderService.create (§5.5) — see the Java source for the
// exact step order; everything below runs inside one transaction.
func (s *OrderService) Create(userID uint, req dto.CreateOrderRequest) (*dto.OrderResponse, error) {
	var created *domain.Order
	err := s.db.Transaction(func(tx *gorm.DB) error {
		orders := s.orders.WithTx(tx)
		productRepo := s.productRep.WithTx(tx)

		// 1. current user's customer profile (getCurrentCustomerEntity).
		customer, err := s.customers.GetCurrentCustomerEntity(tx, userID)
		if err != nil {
			return err
		}

		// 2-3. order number + initial state (PENDING_PAYMENT, flat 15.00).
		order := &domain.Order{
			OrderNumber:  GenerateOrderNumber(),
			CustomerID:   customer.ID,
			Status:       domain.OrderStatusPendingPayment,
			Subtotal:     decimal.Zero,
			Discount:     decimal.Zero,
			ShippingCost: flatShippingCost,
			Total:        decimal.Zero,
			Notes:        req.Notes,
		}

		// 4. shipping address: request's if present, else the profile's.
		if req.ShippingAddress != nil {
			order.ShippingAddress = req.ShippingAddress.ToEntity()
		} else if customer.Address != nil {
			addr := *customer.Address
			order.ShippingAddress = &addr
		}

		// 5. items: product must exist (404), stock check (400 exact
		// message), unit price snapshot, then decrement stock (locked).
		productsByID := make(map[uint]*domain.Product, len(req.Items))
		for _, itemReq := range req.Items {
			product, err := productRepo.FindByIDForUpdate(*itemReq.ProductID)
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return apperror.NotFound("Product", int64(*itemReq.ProductID))
			}
			if err != nil {
				return err
			}
			if !product.HasStock(*itemReq.Quantity) {
				return apperror.Business(fmt.Sprintf(
					"insufficient stock for product '%s'. available: %d, requested: %d",
					product.Name, product.StockQuantity, *itemReq.Quantity))
			}

			item := domain.OrderItem{
				ProductID: product.ID,
				Quantity:  *itemReq.Quantity,
				UnitPrice: product.Price,
			}
			item.CalculateTotal()
			order.AddItem(item)
			productsByID[product.ID] = product

			if err := s.products.DecreaseStockInTx(tx, product.ID, *itemReq.Quantity); err != nil {
				return err
			}
		}

		// 7. coupon (only when the field is present, like Java's null check).
		if req.CouponCode != nil {
			order.Discount = ApplyCoupon(*req.CouponCode, order.Subtotal)
			order.RecalculateTotal()
		}

		// 8. persist order + items (cascade parity).
		if err := orders.Create(order); err != nil {
			return err
		}

		// Assemble the associations OrderResponse.fromEntity reads.
		order.Customer = *customer
		for i := range order.Items {
			order.Items[i].Product = *productsByID[order.Items[i].ProductID]
		}
		created = order
		return nil
	})
	if err != nil {
		return nil, err
	}
	return dto.NewOrderResponse(created), nil
}

// FindByID mirrors findById: 404 "Order not found with id: <id>", then the
// ownership check (400 "you don't have permission to access this order").
func (s *OrderService) FindByID(user *domain.User, id uint) (*dto.OrderResponse, error) {
	order, err := s.orders.FindByIDWithItems(id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apperror.NotFound("Order", int64(id))
	}
	if err != nil {
		return nil, err
	}
	if err := validateOrderAccess(user, order); err != nil {
		return nil, err
	}
	return dto.NewOrderResponse(order), nil
}

// FindByOrderNumber mirrors findByOrderNumber → 404 "Order not found with
// orderNumber: <n>" + ownership check.
func (s *OrderService) FindByOrderNumber(user *domain.User, orderNumber string) (*dto.OrderResponse, error) {
	order, err := s.orders.FindByOrderNumberWithDetails(orderNumber)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apperror.NotFoundByField("Order", "orderNumber", orderNumber)
	}
	if err != nil {
		return nil, err
	}
	if err := validateOrderAccess(user, order); err != nil {
		return nil, err
	}
	return dto.NewOrderResponse(order), nil
}

// FindMyOrders mirrors findMyOrders: current customer's orders, createdAt
// DESC, default size 10 (handler). Missing profile → 404 "Customer profile
// not found. Please create one first." (getCurrentCustomerEntity parity).
func (s *OrderService) FindMyOrders(userID uint, page, size int) (*dto.PageResponse[dto.OrderResponse], error) {
	customer, err := s.customers.GetCurrentCustomerEntity(s.db, userID)
	if err != nil {
		return nil, err
	}
	orders, total, err := s.orders.FindByCustomerID(customer.ID, page, size)
	if err != nil {
		return nil, err
	}
	resp := dto.NewPageResponse(toOrderResponses(orders), page, size, total)
	return &resp, nil
}

// FindAll mirrors findAll (ADMIN): all orders, createdAt DESC.
func (s *OrderService) FindAll(page, size int) (*dto.PageResponse[dto.OrderResponse], error) {
	orders, total, err := s.orders.FindAll(page, size)
	if err != nil {
		return nil, err
	}
	resp := dto.NewPageResponse(toOrderResponses(orders), page, size, total)
	return &resp, nil
}

// FindByStatus mirrors findByStatus (ADMIN).
func (s *OrderService) FindByStatus(status domain.OrderStatus, page, size int) (*dto.PageResponse[dto.OrderResponse], error) {
	orders, total, err := s.orders.FindByStatus(status, page, size)
	if err != nil {
		return nil, err
	}
	resp := dto.NewPageResponse(toOrderResponses(orders), page, size, total)
	return &resp, nil
}

// UpdateStatus mirrors updateStatus (ADMIN) — the transition switch of
// §5.5. Entity guard violations are PLAIN errors (Java IllegalStateException
// → HTTP 500 "an unexpected error occurred"); business-rule violations use
// apperror.Business (400). Stock restoration + cancel run in the same
// transaction, so a failed cancel rolls the restoration back (JPA parity).
func (s *OrderService) UpdateStatus(id uint, req dto.UpdateOrderStatusRequest) (*dto.OrderResponse, error) {
	newStatus, ok := domain.ParseOrderStatus(req.Status)
	if !ok {
		return nil, apperror.Business("invalid status: " + req.Status)
	}

	var updated *domain.Order
	err := s.db.Transaction(func(tx *gorm.DB) error {
		orders := s.orders.WithTx(tx)
		order, err := orders.FindByIDWithItems(id)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apperror.NotFound("Order", int64(id))
		}
		if err != nil {
			return err
		}

		switch newStatus {
		case domain.OrderStatusPaid:
			if err := order.ConfirmPayment(); err != nil {
				return err // "order is not awaiting payment" → 500
			}
		case domain.OrderStatusProcessing:
			if order.Status != domain.OrderStatusPaid {
				return apperror.Business("order must be paid before processing")
			}
			order.Status = domain.OrderStatusProcessing
		case domain.OrderStatusShipped:
			if err := order.Ship(); err != nil {
				return err // "order cannot be shipped in current status" → 500
			}
		case domain.OrderStatusDelivered:
			if err := order.Deliver(); err != nil {
				return err // "order hasn't been shipped yet" → 500
			}
		case domain.OrderStatusCancelled:
			for i := range order.Items {
				if err := s.products.IncreaseStockInTx(tx, order.Items[i].ProductID, order.Items[i].Quantity); err != nil {
					return err
				}
			}
			if err := order.Cancel(); err != nil {
				return err // "order already delivered, cannot be cancelled" → 500
			}
		default:
			// PENDING_PAYMENT hits the Java switch's default arm.
			return apperror.Business("invalid status transition")
		}

		if err := orders.Save(order); err != nil {
			return err
		}
		updated = order
		return nil
	})
	if err != nil {
		return nil, err
	}
	return dto.NewOrderResponse(updated), nil
}

// Cancel mirrors cancel (POST /{id}/cancel?reason=...): ownership check,
// stock restored for every item, cancel(), note appended — one transaction.
func (s *OrderService) Cancel(user *domain.User, id uint, reason string) (*dto.OrderResponse, error) {
	var cancelled *domain.Order
	err := s.db.Transaction(func(tx *gorm.DB) error {
		orders := s.orders.WithTx(tx)
		order, err := orders.FindByIDWithItems(id)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apperror.NotFound("Order", int64(id))
		}
		if err != nil {
			return err
		}
		if err := validateOrderAccess(user, order); err != nil {
			return err
		}

		for i := range order.Items {
			if err := s.products.IncreaseStockInTx(tx, order.Items[i].ProductID, order.Items[i].Quantity); err != nil {
				return err
			}
		}

		if err := order.Cancel(); err != nil {
			return err // DELIVERED → 500
		}
		order.Notes = CancelNote(order.Notes, reason)

		if err := orders.Save(order); err != nil {
			return err
		}
		cancelled = order
		return nil
	})
	if err != nil {
		return nil, err
	}
	return dto.NewOrderResponse(cancelled), nil
}

// GetOrderStats mirrors getOrderStats (counts per status).
func (s *OrderService) GetOrderStats() (*dto.OrderStats, error) {
	count := func(status domain.OrderStatus) (int64, error) {
		return s.orders.CountByStatus(status)
	}
	var stats dto.OrderStats
	var err error
	if stats.PendingPayment, err = count(domain.OrderStatusPendingPayment); err != nil {
		return nil, err
	}
	if stats.Paid, err = count(domain.OrderStatusPaid); err != nil {
		return nil, err
	}
	if stats.Processing, err = count(domain.OrderStatusProcessing); err != nil {
		return nil, err
	}
	if stats.Shipped, err = count(domain.OrderStatusShipped); err != nil {
		return nil, err
	}
	if stats.Delivered, err = count(domain.OrderStatusDelivered); err != nil {
		return nil, err
	}
	if stats.Cancelled, err = count(domain.OrderStatusCancelled); err != nil {
		return nil, err
	}
	return &stats, nil
}

// validateOrderAccess mirrors validateOrderAccess: ADMIN (or MANAGER —
// impossible) can access any order; everyone else only their own
// (order.customer.user.id == current user) — violation → BusinessException
// → 400.
func validateOrderAccess(user *domain.User, order *domain.Order) error {
	if user.Role == domain.UserRoleAdmin {
		return nil
	}
	if order.Customer.UserID != user.ID {
		return apperror.Business("you don't have permission to access this order")
	}
	return nil
}

func toOrderResponses(orders []domain.Order) []dto.OrderResponse {
	responses := make([]dto.OrderResponse, 0, len(orders))
	for i := range orders {
		responses = append(responses, *dto.NewOrderResponse(&orders[i]))
	}
	return responses
}
