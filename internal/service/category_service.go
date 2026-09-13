package service

import (
	"errors"

	"github.com/refleeexzz/order-management/internal/apperror"
	"github.com/refleeexzz/order-management/internal/domain"
	"github.com/refleeexzz/order-management/internal/dto"
	"github.com/refleeexzz/order-management/internal/repository"
	"gorm.io/gorm"
)

// CategoryService mirrors service/CategoryService.
type CategoryService struct {
	categories *repository.CategoryRepository
}

func NewCategoryService(categories *repository.CategoryRepository) *CategoryService {
	return &CategoryService{categories: categories}
}

// Create mirrors CategoryService.create: duplicate name (case-sensitive
// exists check) → 409; the new category is active=true.
func (s *CategoryService) Create(req dto.CreateCategoryRequest) (*dto.CategoryResponse, error) {
	exists, err := s.categories.ExistsByName(req.Name)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, apperror.Duplicate("Category", "name", req.Name)
	}

	category := &domain.Category{
		Name:        req.Name,
		Description: req.Description,
		Active:      true,
	}
	if err := s.categories.Create(category); err != nil {
		return nil, err
	}
	return s.response(category)
}

// FindByID mirrors CategoryService.findById → 404 when absent.
func (s *CategoryService) FindByID(id uint) (*dto.CategoryResponse, error) {
	category, err := s.GetEntityByID(id)
	if err != nil {
		return nil, err
	}
	return s.response(category)
}

// FindAllActive mirrors CategoryService.findAllActive (active only).
func (s *CategoryService) FindAllActive() ([]dto.CategoryResponse, error) {
	categories, err := s.categories.FindAllActive()
	if err != nil {
		return nil, err
	}
	return s.toResponses(categories)
}

// FindAll mirrors CategoryService.findAll (includes inactive — admin only).
func (s *CategoryService) FindAll() ([]dto.CategoryResponse, error) {
	categories, err := s.categories.FindAll()
	if err != nil {
		return nil, err
	}
	return s.toResponses(categories)
}

// Update mirrors CategoryService.update: name+description only, and NO
// duplicate-name re-check (Java parity).
func (s *CategoryService) Update(id uint, req dto.CreateCategoryRequest) (*dto.CategoryResponse, error) {
	category, err := s.GetEntityByID(id)
	if err != nil {
		return nil, err
	}

	category.Name = req.Name
	category.Description = req.Description
	if err := s.categories.Save(category); err != nil {
		return nil, err
	}
	return s.response(category)
}

// Deactivate mirrors CategoryService.deactivate: soft delete (active=false).
func (s *CategoryService) Deactivate(id uint) error {
	category, err := s.GetEntityByID(id)
	if err != nil {
		return err
	}
	category.Active = false
	return s.categories.Save(category)
}

// GetEntityByID mirrors CategoryService.getEntityById — the internal
// accessor ProductService uses to resolve/validate categories
// (404 "Category not found with id: <id>").
func (s *CategoryService) GetEntityByID(id uint) (*domain.Category, error) {
	category, err := s.categories.FindByID(id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apperror.NotFound("Category", int64(id))
	}
	if err != nil {
		return nil, err
	}
	return category, nil
}

func (s *CategoryService) toResponses(categories []domain.Category) ([]dto.CategoryResponse, error) {
	responses := make([]dto.CategoryResponse, 0, len(categories))
	for i := range categories {
		resp, err := s.response(&categories[i])
		if err != nil {
			return nil, err
		}
		responses = append(responses, *resp)
	}
	return responses, nil
}

// response maps a category to its DTO, counting ALL products of the
// category (incl. inactive) like fromEntity does via the lazy products
// collection.
func (s *CategoryService) response(category *domain.Category) (*dto.CategoryResponse, error) {
	count, err := s.categories.CountProducts(category.ID)
	if err != nil {
		return nil, err
	}
	return dto.NewCategoryResponse(category, int(count)), nil
}
