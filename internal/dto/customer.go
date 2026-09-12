package dto

import (
	"github.com/refleeexzz/order-management/internal/domain"
	"github.com/refleeexzz/order-management/internal/httputil"
)

// AddressDto mirrors dto/customer/AddressDto. Every field is optional; only
// the @Size max constraints are enforced (exact Jakarta messages below).
type AddressDto struct {
	Street       string `json:"street" validate:"max=200"`
	Number       string `json:"number" validate:"max=10"`
	Complement   string `json:"complement" validate:"max=100"`
	Neighborhood string `json:"neighborhood" validate:"max=100"`
	City         string `json:"city" validate:"max=100"`
	State        string `json:"state" validate:"max=2"`
	ZipCode      string `json:"zipCode" validate:"max=9"`
}

// AddressMessages maps "<jsonField>.<tag>" to the exact Jakarta messages.
// The same map is reused anywhere an AddressDto is validated nested
// (customer create/update, order create) — the validator reports nested
// fields by their leaf json name (street, number, ...).
var AddressMessages = map[string]string{
	"street.max":       "street cannot exceed 200 characters",
	"number.max":       "number cannot exceed 10 characters",
	"complement.max":   "complement cannot exceed 100 characters",
	"neighborhood.max": "neighborhood cannot exceed 100 characters",
	"city.max":         "city cannot exceed 100 characters",
	"state.max":        "state must be 2 characters",
	"zipCode.max":      "zip code cannot exceed 9 characters",
}

// addressIsEmpty reports whether every address field is blank. Hibernate
// maps an @Embeddable whose columns are ALL null back to a null embedded
// object, so an all-empty Address round-trips as null — ToEntity/AddressDtoFrom
// reproduce that by collapsing all-empty to nil.
func addressIsEmpty(a *domain.Address) bool {
	return a.Street == "" && a.Number == "" && a.Complement == "" &&
		a.Neighborhood == "" && a.City == "" && a.State == "" && a.ZipCode == ""
}

// ToEntity mirrors AddressDto.toEntity. An all-empty dto becomes a nil
// entity (Hibernate all-null-embeddable parity — see addressIsEmpty).
func (d *AddressDto) ToEntity() *domain.Address {
	if d == nil {
		return nil
	}
	addr := &domain.Address{
		Street:       d.Street,
		Number:       d.Number,
		Complement:   d.Complement,
		Neighborhood: d.Neighborhood,
		City:         d.City,
		State:        d.State,
		ZipCode:      d.ZipCode,
	}
	if addressIsEmpty(addr) {
		return nil
	}
	return addr
}

// AddressDtoFrom mirrors AddressDto.fromEntity: null (or all-empty, see
// above) address → nil → JSON null.
func AddressDtoFrom(addr *domain.Address) *AddressDto {
	if addr == nil || addressIsEmpty(addr) {
		return nil
	}
	return &AddressDto{
		Street:       addr.Street,
		Number:       addr.Number,
		Complement:   addr.Complement,
		Neighborhood: addr.Neighborhood,
		City:         addr.City,
		State:        addr.State,
		ZipCode:      addr.ZipCode,
	}
}

// CreateCustomerRequest mirrors dto/customer/CreateCustomerRequest (also used
// by PUT /api/customers/me). The `cpf` tag is the CPF regex registered in
// httputil (Java @Pattern parity).
type CreateCustomerRequest struct {
	CPF     string      `json:"cpf" validate:"notblank,cpf"`
	Phone   string      `json:"phone" validate:"max=15"`
	Address *AddressDto `json:"address"`
}

// CreateCustomerMessages maps "<jsonField>.<tag>" to the exact Jakarta
// messages (AddressMessages merged in).
var CreateCustomerMessages = func() map[string]string {
	m := map[string]string{
		"cpf.notblank": "cpf is required",
		"cpf.cpf":      "cpf must be valid",
		"phone.max":    "phone cannot exceed 15 characters",
	}
	for k, v := range AddressMessages {
		m[k] = v
	}
	return m
}()

// CustomerResponse mirrors dto/customer/CustomerResponse. name/email come
// from the linked User; totalOrders is the size of the customer's orders
// collection (a COUNT in the rewrite — same value). Address is nil → null.
type CustomerResponse struct {
	ID          uint        `json:"id"`
	UserID      uint        `json:"userId"`
	Name        string      `json:"name"`
	Email       string      `json:"email"`
	CPF         string      `json:"cpf"`
	Phone       string      `json:"phone"`
	Address     *AddressDto `json:"address"`
	TotalOrders int64       `json:"totalOrders"`
	CreatedAt   string      `json:"createdAt"`
}

// NewCustomerResponse mirrors CustomerResponse.fromEntity(customer); the
// customer's User association must be loaded.
func NewCustomerResponse(customer *domain.Customer, totalOrders int64) *CustomerResponse {
	return &CustomerResponse{
		ID:          customer.ID,
		UserID:      customer.UserID,
		Name:        customer.User.Name,
		Email:       customer.User.Email,
		CPF:         customer.CPF,
		Phone:       customer.Phone,
		Address:     AddressDtoFrom(customer.Address),
		TotalOrders: totalOrders,
		CreatedAt:   httputil.LocalTime(customer.CreatedAt),
	}
}
