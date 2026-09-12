// Order Management API — Go rewrite of the Spring Boot backend.
// Wiring: config → db connect (gorm) → migrate up → router → http.Server
// with graceful shutdown.
package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/golang-migrate/migrate/v4"
	migratepg "github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"github.com/refleeexzz/order-management/internal/config"
	"github.com/refleeexzz/order-management/internal/handler"
	"github.com/refleeexzz/order-management/internal/repository"
	"github.com/refleeexzz/order-management/internal/security"
	"github.com/refleeexzz/order-management/internal/service"
	"github.com/refleeexzz/order-management/migrations"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlog "gorm.io/gorm/logger"
)

func main() {
	cfg := config.Load()

	db, err := gorm.Open(postgres.Open(cfg.DSN()), &gorm.Config{
		Logger: gormlog.Default.LogMode(gormlog.Warn),
	})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	if err := runMigrations(db); err != nil {
		log.Fatalf("failed to run migrations: %v", err)
	}

	userRepo := repository.NewUserRepository(db)
	tokenProvider := security.NewTokenProvider(cfg.JWTSecret, cfg.JWTExpirationMs)
	authService := service.NewAuthService(userRepo, tokenProvider)

	app := &handler.App{
		Config:        cfg,
		DB:            db,
		UserRepo:      userRepo,
		TokenProvider: tokenProvider,
		AuthService:   authService,
	}

	srv := &http.Server{
		Addr:              ":" + cfg.ServerPort,
		Handler:           app.Router(),
		ReadHeaderTimeout: 10 * time.Second,
	}

	go func() {
		log.Printf("order-management API listening on :%s", cfg.ServerPort)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("server error: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("graceful shutdown failed: %v", err)
	}
	log.Println("server stopped")
}

// runMigrations applies all pending migrations from the embedded FS
// (Flyway parity: runs automatically at startup).
func runMigrations(db *gorm.DB) error {
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}
	driver, err := migratepg.WithInstance(sqlDB, &migratepg.Config{})
	if err != nil {
		return err
	}
	source, err := iofs.New(migrations.FS, ".")
	if err != nil {
		return err
	}
	m, err := migrate.NewWithInstance("iofs", source, "postgres", driver)
	if err != nil {
		return err
	}
	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return err
	}
	log.Println("database migrations applied")
	return nil
}
