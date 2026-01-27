# Order Management System

A robust order management platform built with Java Spring Boot backend and React frontend.

[![CI Pipeline](https://github.com/your-org/order-management/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/order-management/actions/workflows/ci.yml)
[![CD Pipeline](https://github.com/your-org/order-management/actions/workflows/cd.yml/badge.svg)](https://github.com/your-org/order-management/actions/workflows/cd.yml)
[![Security Scan](https://github.com/your-org/order-management/actions/workflows/security.yml/badge.svg)](https://github.com/your-org/order-management/actions/workflows/security.yml)

## 🚀 Tech Stack

### Backend
- Java 21
- Spring Boot 3.4
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL 16
- Redis (caching)
- Flyway (database migrations)
- Swagger/OpenAPI (API docs)

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- TanStack Query
- Zustand
- React Router 7

### DevOps
- Docker & Docker Compose
- GitHub Actions CI/CD
- Multi-stage Docker builds
- Nginx (frontend server)

## 📋 Prerequisites

- Java 21+
- Maven 3.9+
- Node.js 20+
- Docker & Docker Compose

## 🐳 Quick Start with Docker

Run the entire application stack with a single command:

```bash
# Clone the repository
git clone https://github.com/your-org/order-management.git
cd order-management

# Start all services
docker compose up -d
```

### Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **PgAdmin**: http://localhost:5050 (admin@admin.com / admin123)

## 🛠️ Development Setup

### Backend (Spring Boot)

```bash
# Start database and Redis only
docker compose up -d postgres redis

# Run the backend
./mvnw spring-boot:run
```

### Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at http://localhost:5173

## 🏗️ Project Structure

```
order-management/
├── .github/
│   └── workflows/
│       ├── ci.yml           # CI Pipeline
│       ├── cd.yml           # CD Pipeline
│       └── security.yml     # Security scans
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Zustand stores
│   │   ├── lib/             # Utilities & API
│   │   └── types/           # TypeScript types
│   ├── Dockerfile           # Frontend Docker build
│   └── nginx.conf           # Nginx configuration
├── src/main/java/com/ordermanagement/
│   ├── config/              # Security, Swagger, Redis
│   ├── domain/              # JPA entities & enums
│   ├── repository/          # Spring Data repositories
│   ├── service/             # Business logic
│   ├── controller/          # REST endpoints
│   ├── dto/                 # Request/Response objects
│   ├── exception/           # Custom exceptions
│   └── security/            # JWT & auth filters
├── Dockerfile               # Backend Docker build
├── docker-compose.yml       # Development environment
└── docker-compose.prod.yml  # Production environment
```

## 🔧 Docker Commands

```bash
# Start all services
docker compose up -d

# Build and start (rebuild images)
docker compose up -d --build

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop all services
docker compose down

# Stop and remove volumes (clean database)
docker compose down -v

# Production deployment
docker compose -f docker-compose.prod.yml up -d
```

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_DB` | Database name | order_management |
| `POSTGRES_USER` | Database user | postgres |
| `POSTGRES_PASSWORD` | Database password | postgres123 |
| `JWT_SECRET` | JWT signing key | (required) |
| `JWT_EXPIRATION` | Token expiration (ms) | 86400000 |

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Authenticate user |
| GET | /api/products | List products |
| POST | /api/products | Create product |
| GET | /api/orders | List orders |
| POST | /api/orders | Create new order |
| PATCH | /api/orders/{id}/status | Update order status |
| GET | /api/categories | List categories |
| GET | /api/customers | List customers |

## 🔄 CI/CD Pipeline

### CI Pipeline (ci.yml)
Runs on every push and pull request:
- ✅ Backend build & tests
- ✅ Frontend build & lint
- ✅ TypeScript type checking
- ✅ Docker image build
- ✅ Integration tests with Docker Compose

### CD Pipeline (cd.yml)
Runs on version tags (v*):
- 📦 Build multi-platform Docker images
- 🚀 Push to GitHub Container Registry
- 📋 Create GitHub Release
- 🎯 Deploy to staging/production

### Security Scan (security.yml)
Runs weekly and on pushes:
- 🔍 OWASP Dependency Check (Backend)
- 🔍 NPM Audit (Frontend)
- 🔍 Trivy Docker image scan
- 🔍 CodeQL analysis

## ✅ Features

- [x] User authentication (JWT)
- [x] Role-based authorization (Admin, Seller, Customer)
- [x] Customer management
- [x] Product catalog with categories
- [x] Order processing with status tracking
- [x] Shopping cart
- [x] Seller dashboard
- [x] Responsive design
- [x] Docker containerization
- [x] CI/CD pipelines
- [ ] Email notifications
- [ ] Reports and analytics
- [ ] Payment gateway integration

## 📄 License

MIT
