# Backend Dockerfile - Go Application
# Multi-stage build for optimized image size

# Stage 1: Build
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Copy go.mod/go.sum first for dependency caching
COPY go.mod go.sum ./

# Download dependencies (cached layer)
RUN go mod download

# Copy source code
COPY api ./api
COPY cmd ./cmd
COPY internal ./internal
COPY migrations ./migrations

# Build a static, stripped binary (migrations are embedded at build time)
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server ./cmd/api

# Stage 2: Runtime
FROM alpine:3.20 AS runtime

WORKDIR /app

# TLS roots (outbound HTTPS) and timezone data
RUN apk add --no-cache ca-certificates tzdata

# Add non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Copy the built binary from builder stage
COPY --from=builder /app/server /app/server

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Run the application (database migrations run automatically at boot)
ENTRYPOINT ["/app/server"]
