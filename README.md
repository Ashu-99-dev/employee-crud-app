# 🏢 Employee Management System — 3-Tier CRUD Application

A fully containerized, production-style CRUD application built with **HTML/CSS/JavaScript**, **Node.js/Express**, and **PostgreSQL**, orchestrated with **Docker Compose**.

This project demonstrates how a modern 3-tier architecture works, with each tier independently containerized using Docker.

---

## 📐 Architecture

```
                    User / Browser
                          │
                          ▼
                 ┌──────────────────┐
                 │    Frontend      │
                 │  Nginx + HTML    │
                 │  CSS + JS       │
                 │  Port: 8080     │
                 └──────────────────┘
                          │
                    Nginx reverse proxy
                    proxies /api/* requests
                          │
                          ▼
                 ┌──────────────────┐
                 │     Backend      │
                 │  Node.js +      │
                 │  Express.js     │
                 │  Port: 3000     │
                 └──────────────────┘
                          │
                     pg (node-postgres)
                     driver
                          │
                          ▼
                 ┌──────────────────┐
                 │    Database      │
                 │   PostgreSQL 16  │
                 │   Port: 5432    │
                 │   (internal)    │
                 └──────────────────┘
                          │
                          ▼
                   postgres_data
                   (Docker volume)
```

### Tier Breakdown

| Tier       | Technology               | Container          | Port   |
|------------|-------------------------|--------------------|--------|
| Frontend   | Nginx + HTML/CSS/JS     | `employee-frontend` | 8080   |
| Backend    | Node.js + Express       | `employee-api`      | 3000   |
| Database   | PostgreSQL 16           | `employee-db`       | 5432*  |

> \* PostgreSQL port is **not exposed** to the host by default — it's only accessible from within the Docker network.

---

## ✅ Prerequisites

Make sure you have the following installed:

| Tool            | Minimum Version | Check Command            |
|-----------------|----------------|--------------------------|
| Docker          | 20.10+         | `docker --version`       |
| Docker Compose  | 2.0+           | `docker compose version` |
| Git             | 2.0+           | `git --version`          |

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url> employee-crud-app
cd employee-crud-app
```

### 2. Configuration (Optional)

The application works out of the box with default values. To customize, copy and edit the `.env` file:

```bash
cp .env.example .env
# Edit .env with your preferred values
```

### 3. Build the Images

```bash
docker compose build
```

### 4. Start the Application

```bash
docker compose up -d
```

### 5. Access the Application

| Service   | URL                        |
|-----------|----------------------------|
| Frontend  | http://localhost:8080       |
| API       | http://localhost:3000       |
| Health    | http://localhost:3000/health|

### 6. View Container Status

```bash
docker compose ps
```

Expected output:
```
NAME                 IMAGE                      STATUS                   PORTS
employee-db          employee-crud-app-database  Up (healthy)
employee-api         employee-crud-app-backend   Up (healthy)            0.0.0.0:3000->3000/tcp
employee-frontend    employee-crud-app-frontend  Up (healthy)            0.0.0.0:8080->80/tcp
```

---

## 📋 Available Commands

### View Logs

```bash
# All services
docker compose logs -f

# Individual services
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f database
```

### Stop the Application

```bash
# Stop containers (data is preserved)
docker compose down

# Stop containers AND delete database data
docker compose down -v
```

> ⚠️ **WARNING**: `docker compose down -v` removes the PostgreSQL data volume. All employee data will be permanently deleted!

### Rebuild After Code Changes

```bash
docker compose up -d --build
```

---

## 🧪 Testing the API with curl

### Health Check

```bash
curl http://localhost:3000/health
```

### Create an Employee

```bash
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "department": "DevOps",
    "designation": "Cloud Engineer",
    "salary": 70000
  }'
```

### Get All Employees

```bash
curl http://localhost:3000/api/employees
```

### Get a Single Employee

```bash
curl http://localhost:3000/api/employees/1
```

### Update an Employee

```bash
curl -X PUT http://localhost:3000/api/employees/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice.j@example.com",
    "department": "DevOps",
    "designation": "Senior Cloud Engineer",
    "salary": 85000
  }'
```

### Delete an Employee

```bash
curl -X DELETE http://localhost:3000/api/employees/1
```

---

## 📡 REST API Reference

| Method   | Endpoint              | Description             | Status Codes           |
|----------|-----------------------|-------------------------|------------------------|
| `GET`    | `/health`             | Health check            | `200`                  |
| `GET`    | `/api/employees`      | List all employees      | `200`                  |
| `GET`    | `/api/employees/:id`  | Get one employee        | `200`, `404`           |
| `POST`   | `/api/employees`      | Create an employee      | `201`, `400`           |
| `PUT`    | `/api/employees/:id`  | Update an employee      | `200`, `400`, `404`    |
| `DELETE` | `/api/employees/:id`  | Delete an employee      | `200`, `404`           |

### Request Body (POST / PUT)

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "department": "DevOps",
  "designation": "DevOps Engineer",
  "salary": 60000
}
```

### Validation Rules

| Field       | Required | Rules                        |
|-------------|----------|------------------------------|
| name        | Yes      | Non-empty string             |
| email       | Yes      | Valid email format, unique    |
| department  | No       | String                       |
| designation | No       | String                       |
| salary      | No       | Numeric, non-negative        |

---

## 🔄 End-to-End Request Flow

Here's exactly what happens when a user creates a new employee:

```
 1. User opens browser at http://localhost:8080
          │
          ▼
 2. Nginx serves index.html + CSS + JavaScript
          │
          ▼
 3. User fills out the "Add Employee" form and clicks "Save"
          │
          ▼
 4. JavaScript sends a POST request to /api/employees
    (relative URL — handled by Nginx)
          │
          ▼
 5. Nginx proxies the request to http://backend:3000/api/employees
    (Docker DNS resolves "backend" to the backend container's IP)
          │
          ▼
 6. Express receives the request, parses the JSON body
          │
          ▼
 7. employeeController.create() validates the input:
    - Name is required
    - Email is required and valid
    - Salary is numeric and non-negative
          │
          ▼
 8. employeeModel.create() executes a parameterized SQL INSERT:
    INSERT INTO employees (name, email, ...) VALUES ($1, $2, ...)
    (Parameters prevent SQL injection)
          │
          ▼
 9. PostgreSQL stores the row and returns the new record
    with the auto-generated ID and timestamps
          │
          ▼
10. Express returns JSON: { "message": "Employee created successfully", "employee": {...} }
          │
          ▼
11. JavaScript receives the response, shows a success alert,
    and refreshes the employee table
```

---

## 🐳 Docker Concepts Explained

### Docker Image
A **Docker image** is a read-only template that contains everything needed to run an application: code, runtime, libraries, and system tools. Think of it as a snapshot or a recipe. Images are built from `Dockerfile` instructions.

### Docker Container
A **container** is a running instance of an image. It's an isolated, lightweight process with its own filesystem, network, and process space. You can run multiple containers from the same image.

### Docker Network
Containers on the same Docker network can communicate using **service names** as hostnames. Docker runs an internal DNS server that resolves these names.

```
employee-network (bridge)
├── frontend   → resolves "backend" to 172.18.0.3
├── backend    → resolves "database" to 172.18.0.2
└── database   → 172.18.0.2
```

**Why can't the backend use `localhost` to reach PostgreSQL?**

Inside the backend container, `localhost` (127.0.0.1) refers to the **backend container itself** — not the database container. Each container has its own network namespace. To reach PostgreSQL, the backend must use the service name `database`, which Docker DNS resolves to the database container's IP address.

### Docker Volume
A **volume** is persistent storage that exists outside the container filesystem.

```
Without a volume:                    With a volume:
┌──────────────────┐                ┌──────────────────┐
│   Container      │                │   Container      │
│   filesystem     │                │   filesystem     │
│      │           │                │      │           │
│      ▼           │                │      ▼           │
│   /var/lib/      │                │   /var/lib/      │
│   postgresql/    │                │   postgresql/    │
│   data           │                │   data ──────────┼──▶ postgres_data
└──────────────────┘                └──────────────────┘     (volume)
                                                              │
Container removed                   Container removed         ▼
      ▼                                   ▼              Data PERSISTS
 Data LOST ❌                        Data SAFE ✅
```

To verify: stop and remove the database container, then start it again. Your employees will still be there (as long as you used `docker compose down` without `-v`).

### Port Mapping
Port mapping connects a port on your host machine to a port inside a container.

```
Host Machine                    Docker Containers
─────────────                   ─────────────────
localhost:8080  ──────────▶     frontend:80     (Nginx)
localhost:3000  ──────────▶     backend:3000    (Express)
(not exposed)   ──── X ──▶     database:5432   (PostgreSQL)
```

**Which ports need to be public?**
- **Port 8080** (frontend): Yes — users need to access the web UI.
- **Port 3000** (backend): Optional — useful for direct API testing with curl, but in production the frontend's Nginx proxy handles API routing.
- **Port 5432** (database): **No** — the database should only be accessible from the backend, not from the public internet.

---

## 📁 Project Structure

```
employee-crud-app/
│
├── frontend/                   # Presentation Tier
│   ├── index.html              # Main HTML page
│   ├── css/
│   │   └── style.css           # Custom styles
│   ├── js/
│   │   └── app.js              # CRUD logic + API calls
│   ├── nginx.conf              # Nginx config (reverse proxy)
│   └── Dockerfile              # Nginx container
│
├── backend/                    # Application Tier
│   ├── src/
│   │   ├── server.js           # Express entry point
│   │   ├── routes/
│   │   │   └── employeeRoutes.js
│   │   ├── controllers/
│   │   │   └── employeeController.js
│   │   ├── models/
│   │   │   └── employeeModel.js
│   │   ├── config/
│   │   │   └── database.js     # PostgreSQL pool
│   │   └── middleware/
│   │       └── errorHandler.js
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile              # Node.js container
│
├── database/                   # Data Tier
│   ├── init/
│   │   └── init.sql            # Schema + seed data
│   ├── user-data.sh            # User data script for DB server VM
│   └── Dockerfile              # PostgreSQL container
│
├── scripts/
│   ├── database-user-data.sh   # Automated cloud-init / EC2 User Data script
│   └── README.md               # User Data deployment guide
│
├── docker-compose.yml          # Orchestrates all tiers (single host)
├── docker-compose.app.yml      # Orchestrates Frontend + Backend (app host)
├── docker-compose.db.yml       # Orchestrates Database (database host)
├── .env.example                # Full environment template
├── .env.app.example            # App server environment template
├── .env.db.example             # DB server environment template
├── .gitignore
└── README.md                   # This file
```

---

## ☁️ Plug-and-Play Database Server Deployment (User Data / Cloud-Init)

If you are splitting the application across multiple cloud servers/VMs (e.g., AWS EC2, GCP Compute Engine, Azure VMs), you can launch the Database server automatically with zero manual configuration using our **User Data script**:

[`scripts/database-user-data.sh`](file:///scripts/database-user-data.sh)

### What the User Data Script Does:
1. **Installs Docker & Docker Compose** automatically across Ubuntu, Debian, Amazon Linux 2023/2, or RHEL/CentOS.
2. **Deploys database files**: Uses the project's PostgreSQL Compose and initialization scripts (creates `employees` table and inserts seed data).
3. **Starts PostgreSQL** container with health checks and persistent volume storage.
4. **Configures Firewall**: Automatically opens port 5432 in UFW or firewalld if enabled.
5. **Configures MOTD Banner**: Displays your instance's IP and exact backend configuration lines when you SSH into the VM.

### Quick Deployment on AWS EC2:
1. Launch an EC2 instance (Ubuntu 24.04/22.04 LTS or Amazon Linux 2023).
2. Under **Advanced Details** ➔ **User Data**, paste the contents of `scripts/database-user-data.sh`.
3. Set Security Group: Inbound port `5432` from your Application Server security group/IP.
4. Once booted, set `DB_HOST=<database-server-ip>` in your App server's `.env` and start the frontend + backend with:
   ```bash
   docker compose -f docker-compose.app.yml up -d
   ```
See [`scripts/README.md`](file:///scripts/README.md) for full instructions and CLI examples.

---

## 🔒 Security Measures

| Measure                     | Implementation                                                    |
|----------------------------|-------------------------------------------------------------------|
| **Environment variables**   | Secrets are passed via env vars, never hard-coded                 |
| **Parameterized SQL**       | All queries use `$1, $2, ...` placeholders to prevent injection   |
| **Helmet**                  | Sets security HTTP headers (XSS, clickjacking, MIME sniffing)     |
| **CORS**                    | Configured to control which origins can access the API            |
| **Non-root container**      | Backend runs as `appuser`, not `root`                             |
| **No public DB**            | PostgreSQL is not exposed outside the Docker network              |
| **Input validation**        | Server-side validation for all required fields                    |
| **XSS prevention**          | Frontend escapes HTML before rendering user data                  |
| **No SQL concatenation**    | Uses `pg` library's parameterized query support                   |

---

## 🏭 Production vs Development

This project is designed for **learning and development**. For production deployment, consider:

| Area               | Development (this project)        | Production Recommendation                    |
|--------------------|------------------------------------|-----------------------------------------------|
| **Images**         | Single-stage build                 | Multi-stage builds for smaller images         |
| **HTTPS**          | HTTP only                          | TLS certificates (Let's Encrypt)              |
| **Secrets**        | .env file                          | Docker Secrets, Vault, or cloud KMS           |
| **CORS**           | `origin: '*'`                     | Restrict to specific domains                  |
| **Database**       | Single instance                    | Replicas, connection pooling (PgBouncer)      |
| **Backups**        | None                               | Automated pg_dump or WAL archiving            |
| **Logging**        | Console output                     | Structured logging (JSON), log aggregation    |
| **Monitoring**     | Health endpoint                    | Prometheus, Grafana, alerting                 |
| **Reverse Proxy**  | Nginx (basic)                      | Rate limiting, WAF, load balancing            |
| **Image Tags**     | Pinned major versions              | Pin exact versions, scan for CVEs             |
| **Resource Limits**| None                               | Set CPU/memory limits in Compose              |
| **User Auth**      | None                               | JWT, OAuth2, session management               |

---

## 🛠 Troubleshooting

### Containers won't start
```bash
# Check container status
docker compose ps

# Check logs for errors
docker compose logs

# Rebuild from scratch
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

### Backend can't connect to database
- Ensure the database container is healthy: `docker compose ps`
- Check that `DB_HOST` is set to `database` (the Docker service name), not `localhost`
- The backend waits for the database health check to pass before starting

### Port already in use
```bash
# Find what's using the port (e.g., 3000)
lsof -i :3000

# Change the host port in docker-compose.yml, e.g.:
# - "3001:3000"
```

### Database initialization didn't run
PostgreSQL's init scripts only run when the data volume is **empty** (first startup). If you've changed `init.sql`:
```bash
# Remove the volume to force re-initialization
docker compose down -v
docker compose up -d
```

### Frontend shows "Failed to fetch employees"
- Make sure all three containers are running and healthy
- Check that `nginx.conf` correctly proxies `/api/` to `http://backend:3000`
- Check browser DevTools Network tab for request details

### Reset everything
```bash
docker compose down -v --rmi all
docker compose build
docker compose up -d
```

---

## 📄 Database Schema

```sql
CREATE TABLE employees (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    department  VARCHAR(100),
    designation VARCHAR(100),
    salary      NUMERIC(12,2),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Sample Data (loaded on first start)

| Name         | Email                    | Department   | Designation       | Salary     |
|-------------|--------------------------|-------------|-------------------|------------|
| John Doe    | john.doe@example.com     | DevOps      | DevOps Engineer   | $75,000    |
| Jane Smith  | jane.smith@example.com   | Development | Senior Developer  | $85,000    |
| Mike Wilson | mike.wilson@example.com  | QA          | QA Lead           | $70,000    |

---

## 📝 License

This project is for educational purposes. Feel free to use, modify, and distribute.
