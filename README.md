# AI-Enhanced E-commerce Platform

A production-quality monorepo for a final-year graduation project, featuring an AI-enhanced e-commerce backend (Spring Boot) and frontend (Angular).

## Prerequisites
- Java 21 (`java -version`)
- Maven 3.9+ (`mvn -v`)
- Node 20+ and npm 10+
- PostgreSQL 16 on `localhost:5432`

## 1. Create the database (once)
For Ubuntu, macOS (Homebrew), and Windows (EnterpriseDB), run the following as the `postgres` superuser:
```bash
psql -U postgres -f backend/scripts/setup-db.sql
```

## 2. Configure environment
```bash
cp .env.example .env
# AI_PROVIDER=mock works out of the box.
```

## 3. Run the backend
```bash
cd backend
set -a; source ../.env; set +a
mvn spring-boot:run
```
Flyway creates tables + seeds data; `VectorBackfillRunner` fills the 8 seed vectors on first start. Swagger: `http://localhost:8080/swagger-ui.html`.

## 4. Run the frontend
```bash
cd frontend
npm install
npm start
```
Opens on `http://localhost:4200`.

## 5. Default credentials
- Admin: `admin@demo.com` / `Admin123!`
- Shopper: `shopper@demo.com` / `Shopper123!`

## 6. Switching to real Vertex AI
To use real Vertex AI, edit `.env`:
```
AI_PROVIDER=vertex
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
VERTEX_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
```

## 7. Sample curl calls

### Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
-H "Content-Type: application/json" \
-d '{"email":"newuser@demo.com","password":"Password123!"}'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"shopper@demo.com","password":"Shopper123!"}'
# Note the token from the response
```

### List Products
```bash
curl http://localhost:8080/api/products?page=0&size=12
```

### Get Similar Products
```bash
curl http://localhost:8080/api/products/1/similar?limit=6
```

### Admin Upload (Multipart)
```bash
curl -X POST http://localhost:8080/api/admin/products \
-H "Authorization: Bearer <ADMIN_TOKEN>" \
-F "name=Test Product" \
-F "price=99.99" \
-F "stock=10" \
-F "categoryId=1" \
-F "autoApprove=true" \
-F "image=@/path/to/image.jpg"
```

### Admin Update
```bash
curl -X PUT http://localhost:8080/api/admin/products/1 \
-H "Authorization: Bearer <ADMIN_TOKEN>" \
-H "Content-Type: application/json" \
-d '{"name":"Updated Product","price":109.99,"stock":15,"categoryId":1,"description":"New desc","seoTags":["tag1","tag2"]}'
```

### Place Order
```bash
curl -X POST http://localhost:8080/api/orders \
-H "Authorization: Bearer <SHOPPER_TOKEN>"
```

### List Orders
```bash
curl -X GET http://localhost:8080/api/orders \
-H "Authorization: Bearer <SHOPPER_TOKEN>"
```
