# Order Management System

a robust order management api built with java spring boot and postgresql.

## tech stack

- java 21
- spring boot 3.2
- spring security + jwt
- spring data jpa
- postgresql 16
- redis (caching)
- flyway (database migrations)
- swagger/openapi (api docs)
- docker compose

## getting started

### prerequisites

- java 21+
- maven 3.9+
- docker & docker compose

### running the project

1. start the database and redis:
```bash
docker-compose up -d
```

2. run the application:
```bash
./mvnw spring-boot:run
```

3. access swagger ui:
```
http://localhost:8080/swagger-ui.html
```

## project structure

```
src/main/java/com/ordermanagement/
├── config/          # security, swagger, redis configs
├── domain/
│   ├── entity/      # jpa entities
│   └── enums/       # status, roles, etc
├── repository/      # spring data repositories
├── service/         # business logic
├── controller/      # rest endpoints
├── dto/             # request/response objects
├── exception/       # custom exceptions
└── security/        # jwt, auth filters
```

## features

- [x] user authentication (jwt)
- [x] role-based authorization
- [x] customer management
- [x] product catalog with categories
- [x] order processing with status tracking
- [x] payment integration
- [x] stock management
- [ ] email notifications
- [ ] reports and analytics

## api endpoints

| method | endpoint | description |
|--------|----------|-------------|
| POST | /api/auth/register | register new user |
| POST | /api/auth/login | authenticate user |
| GET | /api/products | list products |
| POST | /api/orders | create new order |
| PATCH | /api/orders/{id}/status | update order status |

## license

mit
