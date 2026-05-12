# Project 2 - EmployeeDepartment API + React Frontend

This project is an ASP.NET Core Web API combined with a React frontend that satisfies the Web Engineering assignment requirements using an **Employee / Department / Project** system with authentication and a Hangfire background job.

by: Seif Eldeen Hesham 211004041

---

## Assignment Requirements Coverage

This project includes all required technical items from the PDF:

- ASP.NET Core Web API
- Entity Framework Core with MySQL
- One-to-one relationship
- One-to-many relationship
- Many-to-many relationship
- At least three services using dependency injection
- Create / Update / Read DTOs
- DTO validation using Data Annotations
- JWT authentication with login endpoint
- Authorization using `[Authorize]`
- Role-based authorization
- LINQ `Select()` projection into DTOs
- `AsNoTracking()` for read-only queries
- Async EF Core methods
- EF Core migration included
- Swagger documentation
- Bonus: Hangfire recurring background job

### Frontend Requirements (React)
- React file structure: components, pages, api, context, utils
- React Router routes: `/`, `/login`, `/register`, `/departments`, `/projects`, `/employees`, `/employees/new`, `/employees/:id`, `/employee-requests`
- Axios service layer
- State management with `useState`
- Loading and error states
- Controlled forms
- Fetch, create, update, delete operations
- JWT is read from the `Authorization` response header, not the response body

---

## Domain Design

### Entities
- `Department`
- `Employee`
- `EmployeeProfile`
- `Project`
- `AppUser`

### Relationships
- **One-to-many:** `Department -> Employees`
- **One-to-one:** `Employee -> EmployeeProfile`
- **Many-to-many:** `Employee <-> Project`

The many-to-many relationship is implemented using EF Core skip navigations, which creates the join table `EmployeeProjects` automatically in the database.

---

## Project Structure

```
Project2_final/
├── Controllers/          # API controllers (Auth, Employees, Departments, Projects)
├── DTOs/                 # Request and response DTOs
├── Data/                 # EF Core DbContext
├── Models/               # Entity models
├── Services/             # Business logic layer
├── Interfaces/           # Service contracts
├── Helpers/              # Password hashing helper
├── Jobs/                 # Hangfire recurring job
├── Migrations/           # EF Core migration files
├── Properties/           # launchSettings.json
├── appsettings.json
├── Program.cs
├── Project1.csproj
├── Project2.sln
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── api/          # http.js (Axios instance), services.js (API calls)
        ├── components/   # Layout, Feedback, FormFields, ProtectedRoute
        ├── context/      # AuthContext (JWT session management)
        ├── pages/        # AuthPage, Home, Employees, EmployeeForm,
        │                 # Departments, Projects, EmployeeRequests
        ├── utils/        # format.js (dateInput, money)
        ├── App.jsx       # Route definitions
        ├── main.jsx
        └── styles.css
```

---

## Services

The project contains four services, each registered with dependency injection:

- `DepartmentService`
- `EmployeeService`
- `ProjectService`
- `AuthService`

---

## How to Run

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8)
- [Node.js](https://nodejs.org/) v18+
- MySQL server on port 3306

### 1. Start MySQL (Docker)

```bash
docker rm -f project1-mysql
docker run --name project1-mysql \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -e MYSQL_DATABASE=EmployeeDepartmentDb \
  -p 3306:3306 -d mysql:8.0
```

### 2. Configure the database connection

In `appsettings.json`:

```json
"DefaultConnection": "server=127.0.0.1;port=3306;database=EmployeeDepartmentDb;user=root;password=123456;AllowUserVariables=True"
```

Update credentials if your MySQL setup differs.

### 3. Run the backend

```bash
dotnet restore
dotnet ef database update
dotnet run
```

- Runs on **http://0.0.0.0:5100** (accessible from any device on the local network)
- Swagger UI: `http://localhost:5100/swagger`
- Hangfire dashboard: `http://localhost:5100/hangfire`
- EF migrations run automatically on startup
- Default users are seeded automatically on first run

### 4. Run the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

- Runs on **http://0.0.0.0:5173**
- The API URL is automatically derived from `window.location.hostname`, so the app works from both `localhost` and any network IP (e.g. `192.168.1.36`)
- To override the API URL, create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5100/api
```

---

## Default Users (Auto-Seeded)

| Username | Password  | Role  |
|----------|-----------|-------|
| `admin`  | `admin123` | Admin |
| `user`   | `user123`  | User  |

New accounts can be registered via the Register page (role is selectable at registration).

---

## Role-Based Access

### Admin
- Full CRUD on Employees, Departments, Projects
- Can view employee **salary** and project **budget**
- Can access employee **Details** and **Delete** actions
- Sees **Employee Requests** management panel — approve or reject pending requests
  - Approving a request calls the real API to create the employee in the database

### User
- Read-only view of Employees, Departments, Projects
- **Salary** on employee cards is hidden
- **Budget** on project list and details panel is hidden
- **Details** and **Delete** buttons on employee cards are hidden
- Can submit **Add Employee Requests** which go to admin for approval
- Can track the status of their own submitted requests (Pending / Approved / Rejected)

---

## Frontend Features

### Employees
- Grid card view with avatar initials, job title, department, hire date
- Salary visible to admins only
- Details / Delete actions visible to admins only

### Departments
- Tile grid with employee count
- Admin: inline add / edit / delete form

### Projects
- List view with auto status badge: **Active**, **Upcoming**, or **Completed** (calculated from dates)
- **Click any row** to open a sticky details side panel showing status, description, duration, start/end dates, and budget (admin only)
- Admin: create / edit / delete form

### Employee Requests
- **User mode:** fill out a full employee form and submit for admin approval
- **Admin mode:** tabbed view — Pending, All Requests, My Requests
  - Red badge on sidebar nav shows live pending request count
  - Approve → calls `POST /api/Employees` to create the employee
  - Reject → marks request as rejected
- Requests persist in `localStorage` per browser

---

## Authentication and Authorization

### Authentication

Authentication is implemented using JWT Bearer tokens.

Available auth endpoints:
- `POST /api/Auth/register`
- `POST /api/Auth/login`

The login and register endpoints return the JWT access token in the **response headers**, not in the response body.

Response headers:

```text
Authorization: Bearer {token}
X-Token-Expires-At: {utc-expiration}
```

For protected requests, send the token back in the request header:

```text
Authorization: Bearer {token}
```

### Authorization

Protected endpoints use `[Authorize]`.

Role-based authorization is also implemented:
- `Admin` can create, update, and delete resources
- `Admin` and `User` can access read endpoints where configured

---

## DTO Validation

Validation is implemented with Data Annotations such as:
- `Required`
- `MaxLength`
- `MinLength`
- `EmailAddress`
- `Range`
- `Phone`
- `RegularExpression`

Because controllers use `[ApiController]`, invalid requests automatically return **HTTP 400 Bad Request** before database operations are executed.

---

## LINQ Optimization and Read Performance

Read endpoints use:
- `Select()` to project entities into response DTOs
- `AsNoTracking()` for read-only queries

This prevents returning full EF Core entity objects directly and improves performance.

---

## Hangfire Background Job

A Hangfire recurring job is included as the bonus part.

### Job Name
`ProjectReminderJob`

### What it does
The job runs daily and logs a reminder summary for projects, including:
- project name
- assigned employee count

### Dashboard
```
http://localhost:5100/hangfire
```

---

## Technologies Used

- **ASP.NET Core Web API** — framework for building RESTful APIs
- **Entity Framework Core** — ORM for querying and updating the database
- **Pomelo.EntityFrameworkCore.MySql** — MySQL provider for EF Core
- **MySQL** — relational database
- **JWT (JSON Web Token)** — secure token-based authentication
- **Swagger / Swashbuckle** — API documentation and interactive endpoint testing
- **Hangfire** — recurring background job processing
- **LINQ** — used for projection and query composition
- **Data Annotations** — input validation on DTOs
- **React 18 + Vite** — frontend framework and build tool
- **React Router DOM v6** — client-side routing
- **Axios** — HTTP client with request interceptors

---

## Network Access

The app is configured to work across a local network:

- **Backend** binds to `0.0.0.0:5100` — accepts connections from any IP
- **Frontend** derives the API URL from `window.location.hostname` — opening `http://192.168.1.36:5173` automatically targets `http://192.168.1.36:5100/api`
- **CORS** is set to `AllowAnyOrigin` on the backend

---

## Why HTTP-Only Cookies Are Commonly Used as Industry Standard

HTTP-only cookies are a critical security feature in web applications that prevent client-side scripts from accessing sensitive cookie data. They are the industry standard for authentication security.

### Key Security Benefits

1. **XSS (Cross-Site Scripting) Protection**
   - HTTP-only cookies cannot be read by JavaScript (`document.cookie` returns empty string)
   - Even if an attacker injects malicious scripts through XSS vulnerabilities, they cannot steal the authentication token
   - This prevents session hijacking and unauthorized account access

2. **Token Storage Security vs. localStorage/sessionStorage**
   - `localStorage` and `sessionStorage` are accessible via JavaScript and vulnerable to XSS attacks
   - Any script running on the page can steal tokens from storage: `localStorage.getItem('token')`
   - HTTP-only cookies are completely inaccessible to JavaScript, eliminating this attack vector

3. **Automatic Browser Handling**
   - Browsers automatically include HTTP-only cookies in requests to the same domain
   - No manual token management required in frontend code
   - Reduces risk of accidental token exposure in client-side code

4. **Secure Flag Combination**
   - When combined with the `Secure` flag, cookies are only sent over HTTPS connections
   - When combined with `SameSite=Strict`, CSRF attacks are mitigated
   - Example: `Set-Cookie: auth=xyz; HttpOnly; Secure; SameSite=Strict`

5. **Industry Adoption & Standards**
   - Used by Google, Facebook, banking systems, and all major web applications
   - Recommended by OWASP as best practice
   - Required for compliance with PCI DSS and SOC 2
   - Part of RFC 6265

### How HTTP-Only Cookies Work

**Server Response:**
```
HTTP/1.1 200 OK
Set-Cookie: auth_token=eyJhbGci...; HttpOnly; Secure; SameSite=Strict; Max-Age=3600
```

**Browser Behavior:**
- ✓ Automatically includes cookie in all requests to the same domain
- ✗ JavaScript cannot read: `document.cookie` returns `""`
- ✓ Only transmitted over encrypted HTTPS connections
- ✓ Not sent with cross-origin requests (with SameSite)

### Comparison: HTTP-Only Cookies vs. localStorage

| Feature | HTTP-Only Cookie | localStorage |
|---------|-----------------|--------------|
| JavaScript Access | Blocked | Full access |
| XSS Vulnerability | Protected | Vulnerable |
| Automatic Request Inclusion | Yes | Manual |
| HTTPS Enforcement | With Secure flag | No |
| CSRF Protection | With SameSite | No |
| Token Expiration | Built-in | Manual |

### Why This API Uses JWT in Response Headers

This API does **not** return the access token in the JSON response body. After login/register, the API sends:

```text
Authorization: Bearer {token}
X-Token-Expires-At: {utc-expiration}
```

This keeps the response body cleaner and avoids exposing the token as a normal DTO field. The client reads the `Authorization` response header, stores it, and sends it back on protected requests.

---

## Detailed API Endpoint Documentation

### Authentication Endpoints

#### POST /api/Auth/register

**Request Body:**
```json
{
  "fullName": "John Doe",
  "userName": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "User"
}
```

**Response Headers:**
```text
Authorization: Bearer {token}
X-Token-Expires-At: 2026-04-03T22:30:00.0000000Z
```

**Response Body:**
```json
{
  "expiresAt": "2026-04-03T22:30:00Z",
  "tokenType": "Bearer",
  "userName": "johndoe",
  "role": "User"
}
```

**Error Responses:**
- `400 Bad Request` — Validation errors or duplicate username/email

#### POST /api/Auth/login

**Request Body:**
```json
{
  "userName": "admin",
  "password": "admin123"
}
```

**Response Headers:**
```text
Authorization: Bearer {token}
X-Token-Expires-At: 2026-04-03T22:30:00.0000000Z
```

**Error Responses:**
- `401 Unauthorized` — Invalid username or password

---

### Department Endpoints (Requires Authentication)

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/Departments` | Admin, User |
| GET | `/api/Departments/{id}` | Admin, User |
| POST | `/api/Departments` | Admin only |
| PUT | `/api/Departments/{id}` | Admin only |
| DELETE | `/api/Departments/{id}` | Admin only |

**POST /api/Departments — Request Body:**
```json
{
  "name": "Research & Development",
  "location": "Building C"
}
```

Validation: `name` 2–100 chars, `location` 2–150 chars

**Error Responses:**
- `400 Bad Request` — Cannot delete a department that has assigned employees

---

### Employee Endpoints (Requires Authentication)

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/Employees` | Admin, User |
| GET | `/api/Employees/{id}` | Admin, User |
| POST | `/api/Employees` | Admin only |
| PUT | `/api/Employees/{id}` | Admin only |
| DELETE | `/api/Employees/{id}` | Admin only |

**POST /api/Employees — Request Body:**
```json
{
  "fullName": "Jane Doe",
  "email": "jane.doe@company.com",
  "jobTitle": "Engineer",
  "salary": 85000,
  "hireDate": "2026-01-15T00:00:00",
  "departmentId": 1,
  "profile": {
    "address": "123 Main St",
    "phoneNumber": "+1-555-0456",
    "dateOfBirth": "1990-05-15T00:00:00",
    "emergencyContactName": "John Doe",
    "emergencyContactPhone": "+1-555-9999"
  },
  "projectIds": [1, 2]
}
```

---

### Project Endpoints (Requires Authentication)

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/Projects` | Admin, User |
| GET | `/api/Projects/{id}` | Admin, User |
| POST | `/api/Projects` | Admin only |
| PUT | `/api/Projects/{id}` | Admin only |
| DELETE | `/api/Projects/{id}` | Admin only |

**POST /api/Projects — Request Body:**
```json
{
  "name": "Mobile Application",
  "description": "Develop iOS and Android applications",
  "startDate": "2026-04-01T00:00:00",
  "endDate": "2026-09-30T00:00:00",
  "budget": 100000
}
```

---

## API Screenshots Documentation

The following screenshots demonstrate working API endpoints using Swagger UI:

### Screenshot 1: Login Endpoint Success
**Endpoint:** `POST /api/Auth/login`

Shows successful authentication with:
- **Request:** JSON body with username "admin" and password "admin123"
- **Response:** 200 OK status
- **Response Headers:** Contains `Authorization: Bearer {token}` and `X-Token-Expires-At`
- **Response Body:** Contains expiration time, token type, username, and role only

![Login](<screenshots/Screenshot 2026-04-03 020653.png>)

- **Curl:**
```bash
curl -X POST "https://localhost:7166/api/Auth/login" \
  -H "Content-Type: application/json" \
  -d '{"userName":"admin","password":"admin123"}'
```

### Screenshot 2: Swagger Authorization Setup
![Authorize](screenshots/Screenshot%202026-04-03%20030639.png)

### Screenshot 3: Access Protected Endpoint (GET Departments)
**Endpoint:** `GET /api/Departments`

![GET Departments](screenshots/Screenshot%202026-04-03%20002547.png)

### Screenshot 4: Create Department (POST)
**Endpoint:** `POST /api/Departments`

![Create Department](screenshots/Screenshot%202026-04-03%20002619.png)

### Screenshot 5: Get Department by ID
**Endpoint:** `GET /api/Departments/1`

![GET Department by ID](screenshots/Screenshot%202026-04-03%20022641.png)

### Screenshot 6: 401 Unauthorized Error (No Token)
**Endpoint:** `GET /api/Departments` (without authorization)

![401 Error](screenshots/Screenshot%202026-04-03%20023426.png)

### Screenshot 7: Validation Error (400 Bad Request)
**Endpoint:** `POST /api/Departments`

![Validation Error](screenshots/Screenshot%202026-04-03%20022732.png)

### Screenshot 8: Hangfire Dashboard
**URL:** `https://localhost:7166/hangfire`

![Hangfire](screenshots/Screenshot%202026-04-03%20031658.png)

---

## Endpoints Screenshots

### 1. POST /api/Projects - Create Project
![POST Projects](screenshots/Screenshot%202026-04-03%20002811-2.png)

### 2. GET /api/Projects - List All Projects
![GET Projects](screenshots/Screenshot%202026-04-03%20002752.png)

### 3. PUT /api/Employees/{id} - Update Employee
![PUT Employee](screenshots/Screenshot%202026-04-03%20023426.png)

### 4. POST /api/Employees - Create Employee
![POST Employee](screenshots/Screenshot%202026-04-03%20002711.png)

### 5. GET /api/Employees - List All Employees
![GET Employees](screenshots/Screenshot%202026-04-03%20002640.png)

### 6. POST /api/Auth/login - Authentication
![Login](screenshots/Screenshot%202026-04-03%20033211.png)

### 7. Swagger Authorization Dialog
![Authorize](screenshots/Screenshot%202026-04-03%20020832.png)

### 8. Hangfire Dashboard
![Hangfire](screenshots/Screenshot%202026-04-03%20032648.png)

---

## Testing Flow

Recommended test order:

1. Open Swagger at `http://localhost:5100/swagger`
2. Call `POST /api/Auth/login` using the seeded admin account
3. Copy the JWT token from the `Authorization` response header
4. Click **Authorize** in Swagger and paste `Bearer {token}`
5. Create a department
6. Create a project
7. Create an employee with profile and project assignments
8. Test read, update, and delete endpoints
9. Open `/hangfire` and verify the recurring job exists
10. Open the React frontend at `http://localhost:5173`
11. Log in as `admin` and test all CRUD flows
12. Log out and log in as `user` — verify salary, budget, Details, and Delete are all hidden

---

## Configuration Reference

### `appsettings.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "server=127.0.0.1;port=3306;database=EmployeeDepartmentDb;user=root;password=123456;AllowUserVariables=True"
  },
  "Jwt": {
    "Key": "ThisIsASecretKeyForJwtToken123456789",
    "Issuer": "EmployeeDepartment",
    "Audience": "EmployeeDepartmentUsers",
    "DurationInMinutes": 60
  }
}
```

> **Note:** Change `Jwt:Key` to a strong random secret before deploying to production.
