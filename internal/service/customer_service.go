package service

import (
	"errors"

	"github.com/refleeexzz/order-management/internal/apperror"
	"github.com/refleeexzz/order-management/internal/domain"
	"github.com/refleeexzz/order-management/internal/dto"
	"github.com/refleeexzz/order-management/internal/repository"
	"gorm.io/gorm"
)

// CustomerService mirrors service/CustomerService. The "current user" is
// passed in by the handler (SecurityContextHolder principal parity — the
// User entity loaded by the JWT filter).
type CustomerService struct {
	customers *repository.CustomerRepository
}

func NewCustomerService(customers *repository.CustomerRepository) *CustomerService {
	return &CustomerService{customers: customers}
}

// FindAll mirrors CustomerService.findAll — Spring Page<CustomerResponse>
// sorted id DESC (controller default).
func (s *CustomerService) FindAll(page, size int) (*dto.SpringPage[dto.CustomerResponse], error) {
	customers, total, err := s.customers.FindAll(page, size)
	if err != nil {
		return nil, err
	}
	counts, err := s.orderCounts(customers)
	if err != nil {
		return nil, err
	}
	content := make([]dto.CustomerResponse, 0, len(customers))
	for i := range customers {
		content = append(content, *dto.NewCustomerResponse(&customers[i], counts[customers[i].ID]))
	}
	resp := dto.NewSpringPage(content, page, size, total, true)
	return &resp, nil
}

// CreateForCurrentUser mirrors createForCurrentUser: the current user may
// have only one profile (409 otherwise); the CPF must be unique (409);
// the profile is linked to the current user.
func (s *CustomerService) CreateForCurrentUser(user *domain.User, req dto.CreateCustomerRequest) (*dto.CustomerResponse, error) {
	if _, err := s.customers.FindByUserID(user.ID); err == nil {
		return nil, apperror.DuplicateMsg("Customer profile already exists for this user")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	exists, err := s.customers.ExistsByCPF(req.CPF)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, apperror.Duplicate("Customer", "cpf", req.CPF)
	}

	customer := &domain.Customer{
		UserID:  user.ID,
		CPF:     req.CPF,
		Phone:   req.Phone,
		Address: req.Address.ToEntity(),
	}
	if err := s.customers.Create(customer); err != nil {
		return nil, err
	}
	customer.User = *user
	return dto.NewCustomerResponse(customer, 0), nil
}

// GetCurrentCustomer mirrors getCurrentCustomer → 404 "Customer profile
// not found for current user".
func (s *CustomerService) GetCurrentCustomer(userID uint) (*dto.CustomerResponse, error) {
	customer, err := s.customers.FindByUserID(userID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apperror.NotFoundMsg("Customer profile not found for current user")
	}
	if err != nil {
		return nil, err
	}
	count, err := s.countOrders(customer.ID)
	if err != nil {
		return nil, err
	}
	return dto.NewCustomerResponse(customer, count), nil
}

// FindByID mirrors findById → 404 "Customer not found with id: <id>".
func (s *CustomerService) FindByID(id uint) (*dto.CustomerResponse, error) {
	customer, err := s.customers.FindByID(id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apperror.NotFound("Customer", int64(id))
	}
	if err != nil {
		return nil, err
	}
	count, err := s.countOrders(customer.ID)
	if err != nil {
		return nil, err
	}
	return dto.NewCustomerResponse(customer, count), nil
}

// UpdateCurrentCustomer mirrors updateCurrentCustomer: 404 as
// getCurrentCustomer; updates PHONE AND ADDRESS ONLY (cpf is not updatable;
// the address is replaced only when provided in the request).
func (s *CustomerService) UpdateCurrentCustomer(userID uint, req dto.CreateCustomerRequest) (*dto.CustomerResponse, error) {
	customer, err := s.customers.FindByUserID(userID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apperror.NotFoundMsg("Customer profile not found for current user")
	}
	if err != nil {
		return nil, err
	}

	customer.Phone = req.Phone
	if req.Address != nil {
		customer.Address = req.Address.ToEntity()
	}

	if err := s.customers.Save(customer); err != nil {
		return nil, err
	}
	count, err := s.countOrders(customer.ID)
	if err != nil {
		return nil, err
	}
	return dto.NewCustomerResponse(customer, count), nil
}

// GetCurrentCustomerEntity mirrors getCurrentCustomerEntity (used by
// OrderService) → 404 "Customer profile not found. Please create one first."
// Runs against the given DB handle so callers can stay inside their
// transaction.
func (s *CustomerService) GetCurrentCustomerEntity(db *gorm.DB, userID uint) (*domain.Customer, error) {
	customer, err := s.customers.WithTx(db).FindByUserID(userID)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apperror.NotFoundMsg("Customer profile not found. Please create one first.")
	}
	if err != nil {
		return nil, err
	}
	return customer, nil
}

func (s *CustomerService) countOrders(customerID uint) (int64, error) {
	counts, err := s.customers.CountOrdersByCustomerIDs([]uint{customerID})
	if err != nil {
		return 0, err
	}
	return counts[customerID], nil
}

func (s *CustomerService) orderCounts(customers []domain.Customer) (map[uint]int64, error) {
	ids := make([]uint, 0, len(customers))
	for i := range customers {
		ids = append(ids, customers[i].ID)
	}
	return s.customers.CountOrdersByCustomerIDs(ids)
}
