package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config holds all runtime configuration, sourced from environment
// variables (with an optional .env file) and parity defaults from the
// Spring Boot application.yml.
type Config struct {
	ServerPort  string
	DatabaseURL string // full DSN; when set it takes precedence over DB_* parts
	DBHost      string
	DBPort      string
	DBName      string
	DBUser      string
	DBPassword  string
	JWTSecret   string
	// JWTExpirationMs is the token lifetime in milliseconds (parity with
	// the Java `jwt.expiration` property).
	JWTExpirationMs int64
}

// Load reads configuration from the environment. A .env file in the
// working directory is loaded when present; any error is ignored.
func Load() *Config {
	_ = godotenv.Load()

	return &Config{
		ServerPort:      getEnv("SERVER_PORT", "8080"),
		DatabaseURL:     os.Getenv("DATABASE_URL"),
		DBHost:          getEnv("DB_HOST", "localhost"),
		DBPort:          getEnv("DB_PORT", "5433"),
		DBName:          getEnv("DB_NAME", "order_management"),
		DBUser:          getEnv("DB_USER", "postgres"),
		DBPassword:      getEnv("DB_PASSWORD", "postgres123"),
		JWTSecret:       getEnv("JWT_SECRET", "minha-chave-secreta-super-segura-com-pelo-menos-256-bits-para-hs256"),
		JWTExpirationMs: getEnvInt64("JWT_EXPIRATION", 86400000),
	}
}

// DSN returns the connection string used by GORM/pgx.
func (c *Config) DSN() string {
	if c.DatabaseURL != "" {
		return c.DatabaseURL
	}
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		c.DBHost, c.DBPort, c.DBUser, c.DBPassword, c.DBName,
	)
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvInt64(key string, fallback int64) int64 {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.ParseInt(v, 10, 64); err == nil {
			return n
		}
	}
	return fallback
}
