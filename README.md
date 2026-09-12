# Order Management System

Sistema de gestão de pedidos (marketplace) com API REST, frontend web e aplicativo Android. Cobre catálogo de produtos e categorias, perfis de cliente, ciclo completo de pedidos (criação, pagamento, envio, entrega, cancelamento) e pagamentos simulados (PIX, boleto, cartão).

O backend foi reescrito de Java/Spring Boot para **Go**, mantendo paridade comportamental com a API original.

## Stack

| Camada | Tecnologias |
|---|---|
| **Backend** | Go 1.23, chi (roteador), GORM (ORM), golang-migrate (migrations embutidas), JWT (golang-jwt), BCrypt, PostgreSQL 16 |
| **Frontend** | React 18 + TypeScript + Tailwind CSS + Vite (em `frontend/`) |
| **Mobile** | App Android em Kotlin + Jetpack Compose (em `android/`) |
| **Infra** | Docker / Docker Compose, GitHub Actions (CI/CD), Railway |

## Como rodar (sem Docker)

### Pré-requisitos

- **Go 1.23+**
- **Node.js 20+** (para o frontend)
- **PostgreSQL 16** rodando localmente

### 1. Banco de dados

Crie o banco `order_management`. O backend espera, por padrão, o PostgreSQL em `localhost:5433` com usuário `postgres` e senha `postgres123` (ajuste via variáveis de ambiente se o seu setup for diferente — veja a tabela abaixo):

```bash
createdb -h localhost -p 5433 -U postgres order_management
```

As migrations rodam automaticamente no boot (estão embutidas no binário), criando todo o schema.

### 2. Backend

```bash
go run ./cmd/api
```

A API sobe em **http://localhost:8080**.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

O app sobe em **http://localhost:5173**.

### Endereços

| O quê | Onde |
|---|---|
| App web | http://localhost:5173 |
| API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| OpenAPI JSON | http://localhost:8080/api-docs |
| Health check | http://localhost:8080/actuator/health |

## Como rodar com Docker

Sobe PostgreSQL (porta 5433), backend (8080), frontend (3000) e pgAdmin (5050):

```bash
docker compose up --build
```

Para produção (imagens pré-construídas, sem portas de banco expostas):

```bash
docker compose -f docker-compose.prod.yml up -d
```

## Endpoints

Legenda de acesso: **público** (sem token), **auth** (qualquer usuário autenticado), **ADMIN** (somente role ADMIN).

### Auth

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/api/auth/register` | público | Registra usuário (role opcional: ADMIN/SELLER/CUSTOMER; padrão CUSTOMER) |
| POST | `/api/auth/login` | público | Login; retorna token JWT |

### Categorias

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/categories` | público | Lista categorias ativas |
| GET | `/api/categories/all` | ADMIN | Lista todas (incl. inativas) |
| GET | `/api/categories/{id}` | público | Busca por id |
| POST | `/api/categories` | ADMIN | Cria categoria |
| PUT | `/api/categories/{id}` | ADMIN | Atualiza nome/descrição |
| DELETE | `/api/categories/{id}` | ADMIN | Desativa (soft delete) |

### Produtos

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/products` | público | Lista ativos, paginado (ordenação fixa `name ASC`) |
| GET | `/api/products/{id}` | público | Busca por id |
| GET | `/api/products/sku/{sku}` | público | Busca por SKU |
| GET | `/api/products/category/{categoryId}` | público | Lista por categoria, paginado |
| GET | `/api/products/search?query=` | público | Busca por nome (substring, case-insensitive) |
| GET | `/api/products/low-stock?threshold=` | ADMIN | Estoque baixo (padrão threshold=10) |
| POST | `/api/products` | ADMIN | Cria produto |
| PUT | `/api/products/{id}` | ADMIN | Atualização parcial (sku não muda) |
| DELETE | `/api/products/{id}` | ADMIN | Desativa (soft delete) |

### Clientes

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/api/customers` | auth | Cria o perfil de cliente do usuário logado |
| GET | `/api/customers/me` | auth | Perfil do usuário logado |
| PUT | `/api/customers/me` | auth | Atualiza telefone/endereço (CPF não muda) |
| GET | `/api/customers` | ADMIN | Lista clientes, paginado (formato Spring Page) |
| GET | `/api/customers/{id}` | ADMIN | Busca por id |

### Pedidos

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/api/orders` | auth | Cria pedido (usa o perfil do usuário logado) |
| GET | `/api/orders/my-orders` | auth | Meus pedidos, paginado |
| GET | `/api/orders/{id}` | auth* | Busca por id (*dono ou ADMIN) |
| GET | `/api/orders/number/{orderNumber}` | auth* | Busca por número (*dono ou ADMIN) |
| POST | `/api/orders/{id}/cancel?reason=` | auth* | Cancela e restaura estoque (*dono ou ADMIN) |
| GET | `/api/orders` | ADMIN | Lista todos, paginado |
| GET | `/api/orders/status/{status}` | ADMIN | Lista por status, paginado |
| GET | `/api/orders/stats` | ADMIN | Contagem por status |
| PATCH | `/api/orders/{id}/status` | ADMIN | Transição de status |

### Pagamentos

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/api/payments` | auth | Processa pagamento de um pedido |
| GET | `/api/payments/order/{orderId}` | auth | Pagamento de um pedido |
| POST | `/api/payments/{paymentId}/refund` | ADMIN | Estorna um pagamento PAID |

### Infra

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/actuator/health` | público | Health check (`{"status":"UP"}`) |
| GET | `/api-docs` · `/v3/api-docs` | público | Especificação OpenAPI 3.0 (JSON) |
| GET | `/swagger-ui.html` · `/swagger-ui/*` | público | Swagger UI |

## Regras de negócio e papéis

- **Papéis (roles):** `ADMIN`, `SELLER`, `CUSTOMER`. O registro é aberto — qualquer um pode se registrar com qualquer role.
- **Quirk MANAGER (paridade com o backend Java):** as operações de escrita e leituras administrativas exigem, no nível de método, `ADMIN` ou `MANAGER` — e `MANAGER` não existe como role. Na prática, **somente ADMIN** cria/edita/remove produtos e categorias, lista clientes/pedidos e altera status; `SELLER` recebe `403`.
- **Pedidos:** número no formato `ORD-AAAAMMDD-XXXXX`; **frete fixo de R$ 15,00** em todo pedido; cupom **`FIRST10`** dá 10% de desconto sobre o subtotal (cupom desconhecido = sem desconto, sem erro); **o estoque é baixado na criação do pedido** e **restaurado em qualquer cancelamento**.
- **Status do pedido:** `PENDING_PAYMENT → PAID → PROCESSING → SHIPPED → DELIVERED` (ou `CANCELLED` de qualquer estado exceto `DELIVERED`).
- **Pagamentos (simulação):** **PIX e boleto (BANK_SLIP) são sempre aprovados**; cartão de crédito/débito (e TED) exigem `cardToken` não vazio, senão o pagamento fica `FAILED`. Pagamento aprovado marca o pedido como `PAID`. Estorno exige pagamento `PAID` e **não** altera o status do pedido.
- **Erros:** JSON no formato `{ status, error, message, path, timestamp, fieldErrors? }`; validações retornam `400` com `fieldErrors` detalhando campo a campo.

## Variáveis de ambiente

Veja `.env.example` para o template completo.

| Variável | Padrão | Descrição |
|---|---|---|
| `SERVER_PORT` | `8080` | Porta HTTP da API |
| `DB_HOST` | `localhost` | Host do PostgreSQL |
| `DB_PORT` | `5433` | Porta do PostgreSQL |
| `DB_NAME` | `order_management` | Nome do banco |
| `DB_USER` | `postgres` | Usuário do banco |
| `DB_PASSWORD` | `postgres123` | Senha do banco |
| `DATABASE_URL` | — | DSN completo; se definido, tem precedência sobre `DB_*` |
| `JWT_SECRET` | `minha-chave-secreta-...` | Segredo HMAC-SHA256 do JWT (mín. 32 bytes) |
| `JWT_EXPIRATION` | `86400000` | Validade do token em ms (24h) |
| `VITE_API_URL` | — | URL da API para o frontend (ex.: `http://localhost:8080`) |
| `VITE_IMGBB_API_KEY` | — | Chave do imgbb (upload de imagens no frontend) |
| `BACKEND_IMAGE` / `FRONTEND_IMAGE` | — | Imagens Docker usadas pelo compose de produção |

## Estrutura do projeto

```
.
├── api/                    # OpenAPI spec embutida (openapi.json + embed)
├── cmd/api/                # Ponto de entrada do backend (main.go)
├── internal/
│   ├── apperror/           # Erros tipados → status HTTP
│   ├── config/             # Configuração via env (+ .env opcional)
│   ├── domain/             # Entidades e enums
│   ├── dto/                # Requests/responses da API
│   ├── handler/            # Handlers HTTP + rotas (chi)
│   ├── httputil/           # JSON, validação, dinheiro
│   ├── middleware/         # JWT auth, guards de role, CORS
│   ├── repository/         # Acesso a dados (GORM)
│   ├── security/           # JWT provider + BCrypt
│   └── service/            # Regras de negócio
├── migrations/             # SQL de migration (embutido no binário)
├── frontend/               # React 18 + TS + Tailwind + Vite
├── android/                # App Android (Kotlin + Jetpack Compose)
├── .github/workflows/      # CI, CD e security scan
├── Dockerfile              # Imagem do backend (multi-stage)
├── docker-compose.yml      # Stack de desenvolvimento
├── docker-compose.prod.yml # Stack de produção
└── railway.toml            # Deploy na Railway (via Dockerfile)
```

## Testes

```bash
go test ./...
```

Testes unitários de domínio, DTOs, segurança (JWT/BCrypt) e serviços. `go vet ./...` e `gofmt` fazem parte do padrão do projeto.

## CI/CD

- **CI** (`.github/workflows/ci.yml`): backend em Go (`go build`, `go vet`, `go test` com PostgreSQL 16 em serviço), frontend (`npm ci`, lint, build, type-check), build das imagens Docker e teste de integração via `docker compose`.
- **Security** (`.github/workflows/security.yml`): `govulncheck` no backend, `npm audit` no frontend, Trivy nas imagens e CodeQL (Go + JavaScript).
- **CD** (`.github/workflows/cd.yml`): em tags `v*`, build e push das imagens para o ghcr.io e criação de release.
