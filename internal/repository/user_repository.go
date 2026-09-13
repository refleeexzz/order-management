// Package repository contains the GORM-backed repositories.
package repository

import (
	"github.com/refleeexzz/order-management/internal/domain"
	"gorm.io/gorm"
)

// UserRepository mirrors UserRepository (Spring Data).
type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

// FindByEmail returns the user with the given email, or
// gorm.ErrRecordNotFound when absent.
func (r *UserRepository) FindByEmail(email string) (*domain.User, error) {
	var user domain.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// ExistsByEmail mirrors existsByEmail.
func (r *UserRepository) ExistsByEmail(email string) (bool, error) {
	var count int64
	if err := r.db.Model(&domain.User{}).Where("email = ?", email).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// Create persists a new user (id and created_at are populated on return).
func (r *UserRepository) Create(user *domain.User) error {
	return r.db.Create(user).Error
}
