# TaskFlow — Production-Grade Collaborative Task Management Platform

> Full-Stack · Node.js + React + PostgreSQL · JWT Auth · Role-Based Access Control · Live Deployed on Railway

[![Live Demo](https://img.shields.io/badge/LIVE%20DEMO-Click%20Here-brightgreen?style=for-the-badge&logo=railway)](https://task-manager-production-0aaa.up.railway.app/login)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql)](https://supabase.com)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## What Is This?

TaskFlow is a **production-ready, multi-user team task management platform** built from scratch — no boilerplate generators, no starter kits. It lets teams create projects, assign tasks, manage members, and track progress through a Kanban board and analytics dashboard.

**What makes it production-grade:**
- Role-based access control enforced **on the server** (not just hidden in the UI)
- Single-service Railway deployment — one URL, zero CORS issues
- Prisma-managed schema with cascade deletes for data integrity
- JWT authentication with bcrypt-hashed passwords
- Axios interceptors for centralized 401 handling

---

## Screenshots — Proof It Works

### Dashboard — Real-Time Analytics
![Dashboard](docs/screenshots/dashboard.png)
*Aggregated stats: total tasks, breakdown by status & priority, per-user distribution, overdue count — all from a single `/api/dashboard` query.*

### Project Management — Kanban Board
![Project Management](docs/screenshots/project-management.png)
*Three-column Kanban (To Do / In Progress / Done), priority badges (color-coded), assignee info, overdue detection, and role-gated controls.*

---

## Live Demo — Try It Yourself

**URL:** https://task-manager-production-0aaa.up.railway.app/login

| Step | Action | What It Proves |
|------|--------|---------------|
| 1 | Register as `admin@demo.com` | JWT auth + bcrypt hashing |
| 2 | Create a project "Alpha Sprint" | Creator auto-assigned Admin role |
| 3 | Add `member@demo.com` as Member | Email-based member invite |
| 4 | Create 3 tasks, assign one to member | Task creation (admin-only) |
| 5 | Set one task's due date to yesterday | Overdue detection |
| 6 | Log in as `member@demo.com` | **See only their assigned task (RBAC proof)** |
| 7 | Member tries to create a task | Button hidden + API returns 403 |
| 8 | Member updates their task status | Allowed — status-only update enforced by API |
| 9 | Open Dashboard | Live stats with overdue count |
| 10 | `GET /api/health` | `{ "status": "ok" }` — health check |

---

## Features

### Authentication
- JWT signup/login with 7-day token expiry
- bcrypt password hashing (cost factor 10 — OWASP standard)
- `GET /api/auth/me` for token validation on page load
- Axios interceptor: injects Bearer token on every request, auto-redirects on 401
- Login returns identical error for wrong email vs wrong password (prevents user enumeration)

### Project Management
- Create projects — creator automatically becomes Admin
- Add team members by email with role selection (Admin / Member)
- Remove members
- View all project members with roles

### Kanban Task Board
- Three fixed columns: **To Do / In Progress / Done**
- Priority levels: **High / Medium / Low** with color-coded badges
- Due date support with **overdue detection** (red badge)
- Inline status updates without page reload

### Role-Based Access Control (RBAC)
- **Enforced on the API, not just the UI** — calling restricted endpoints directly with `curl` still returns 403
- Admin: full CRUD on tasks, members, and projects
- Member: can only view their assigned tasks and update their own task status

### Dashboard Analytics
- Total tasks, breakdown by status and priority
- Per-user task distribution
- Overdue task count
- All computed server-side in a single `/api/dashboard` endpoint

### API Documentation
- In-app interactive `/docs` page listing all endpoints with request/response formats

### Health Check
- `GET /api/health` — uptime monitoring endpoint

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Backend** | Node.js + Express | Fast REST API development, vast ecosystem |
| **ORM** | Prisma | Type-safe queries, auto migrations, cascade deletes |
| **Database** | PostgreSQL (Supabase) | Relational model fits project/task/member relations |
| **Auth** | JWT + bcryptjs | Stateless (no Redis needed), bcrypt is slow by design |
| **Validation** | express-validator | Declarative, prevents XSS and bad data at the boundary |
| **Frontend** | React 18 + Vite | Fast HMR, component model, modern JSX |
| **Routing** | React Router v6 | Protected routes, nested layouts |
| **State** | React Context API | Right-sized — no Redux overhead for this scope |
| **Styling** | Tailwind CSS | No custom CSS files, responsive by default |
| **HTTP Client** | Axios | Interceptors for auth injection + 401 handling |
| **Deployment** | Railway | Git-push deploys, Node.js native, free tier |
| **DB Hosting** | Supabase | Free PostgreSQL, Prisma-compatible, no credit card |

---

## Architecture

```
                ┌───────────────────────────────────────┐
                │           Railway (Single Service)     │
                │                                        │
                │   ┌───────────────────────────────┐   │
                │   │        Express.js App          │   │
                │   │                                │   │
                │   │  ┌─────────┐  ┌─────────────┐  │   │
                │   │  │ /api/*  │  │ Static React│  │   │
                │   │  │ Routes  │  │ Build (SPA) │  │   │
                │   │  └────┬────┘  └─────────────┘  │   │
                │   └───────┼───────────────────────┘   │
                └───────────┼───────────────────────────┘
                            │ Prisma ORM
                            ▼
                ┌─────────────────────┐
                │      Supabase       │
                │    PostgreSQL DB    │
                └─────────────────────┘
```

**Request Flow:**
- `Browser → /api/*` → Express route → auth middleware → RBAC check → Prisma → PostgreSQL → JSON
- `Browser → any other path` → Express `*` catch-all → serve `frontend/dist/index.html` → React SPA

**Why single service?** Two separate Railway services = two separate domains = CORS configuration. CORS bugs are the #1 cause of hackathon demo failures. Serving the React build from Express eliminates this entirely: one URL, one SSL cert, zero CORS.

---

## Database Schema

```
User ──────< ProjectMember >────── Project
                                       │
                                       └──────< Task >── User (assignedTo)
```

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String   // bcrypt hash — never plaintext
  createdAt DateTime @default(now())
}

model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  createdById String   // FK → User
}

model ProjectMember {           // Junction table — holds role PER project
  projectId String              // FK → Project (onDelete: Cascade)
  userId    String              // FK → User    (onDelete: Cascade)
  role      String @default("member")  // "admin" | "member"
  @@unique([projectId, userId])
}

model Task {
  id           String    @id @default(cuid())
  title        String
  description  String?
  dueDate      DateTime?
  priority     String    @default("medium")  // low | medium | high
  status       String    @default("todo")    // todo | inprogress | done
  projectId    String    // FK → Project (onDelete: Cascade)
  assignedToId String?   // FK → User (nullable)
  createdById  String    // FK → User
}
```

**Key design decision — Why `ProjectMember` junction table instead of a role column on User?**
A user can be Admin on Project A and Member on Project B. A global role column can't express this. The junction table holds role *per (project, user)* pair — the correct relational model, and exactly how Jira, Linear, and Notion model it.

---

## RBAC — Enforced Server-Side

> Hiding buttons in React is not security. Every restricted action verifies the caller's role via a Prisma query before executing.

| Action | Admin | Member |
|--------|:-----:|:------:|
| Create / delete project | ✅ | ❌ |
| Add / remove members | ✅ | ❌ |
| Create / delete tasks | ✅ | ❌ |
| Update any task field | ✅ | ❌ |
| Update own task **status only** | ✅ | ✅ |
| View **all** project tasks | ✅ | ❌ |
| View **own assigned** tasks | ✅ | ✅ |
| View dashboard | ✅ | ✅ |

**How it's enforced in code:**

```js
// Task listing — server-side filter, not UI filter
const where = { projectId };
if (membership.role === 'member') {
  where.assignedToId = req.userId;  // Members only see their tasks
}

// Task update — field-level restriction by role
const updateData = isAdmin
  ? { title, description, dueDate, priority, status, assignedToId }
  : { status };  // Members can ONLY change status
```

---

## API Reference

**Base URL:** `https://task-manager-production-0aaa.up.railway.app/api`
**Auth:** `Authorization: Bearer <token>`

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST` | `/auth/signup` | ❌ | Register — returns JWT + user |
| `POST` | `/auth/login` | ❌ | Login — returns JWT + user |
| `GET` | `/auth/me` | ✅ | Current user from token |

### Projects

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/projects` | ✅ | List user's projects |
| `POST` | `/projects` | ✅ | Create project (creator → Admin) |
| `GET` | `/projects/:id` | ✅ Member+ | Project + tasks + members |
| `POST` | `/projects/:id/members` | ✅ Admin | Add member by email |
| `DELETE` | `/projects/:id/members/:userId` | ✅ Admin | Remove member |

### Tasks

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/tasks?projectId=` | ✅ Member+ | Tasks (role-filtered) |
| `POST` | `/tasks` | ✅ Admin | Create task |
| `PUT` | `/tasks/:id` | ✅ | Update (field-restricted by role) |
| `DELETE` | `/tasks/:id` | ✅ Admin | Delete task |

### Dashboard & Health

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/dashboard` | ✅ | Aggregated stats |
| `GET` | `/health` | ❌ | `{ "status": "ok" }` |

---

## Local Setup

### Prerequisites
- Node.js v18+
- PostgreSQL database — free [Supabase](https://supabase.com) project works perfectly

### 1. Clone
```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow
```

### 2. Install dependencies
```bash
npm run install:all
```

### 3. Configure environment
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/taskmanager"
JWT_SECRET="your-strong-random-secret-min-32-chars"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

**Supabase:** Settings → Database → Connection string → URI

### 4. Run migrations
```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
cd ..
```

### 5. Start dev servers
```bash
# Terminal 1 — Backend (port 3001)
npm run dev:backend

# Terminal 2 — Frontend (port 5173, proxies /api to backend)
npm run dev:frontend
```

Open **http://localhost:5173**

---

## Railway Deployment

### 1. Supabase database
1. [supabase.com](https://supabase.com) → New Project
2. Settings → Database → Connection string → URI → copy

### 2. Push to GitHub
```bash
git add . && git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/taskflow.git
git push -u origin main
```

### 3. Railway setup
1. [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repo — `railway.json` auto-detected
3. Add environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Supabase PostgreSQL URI |
| `JWT_SECRET` | 32+ char random string |
| `NODE_ENV` | `production` |

4. Settings → Networking → Generate Domain
5. Verify: `GET https://your-app.railway.app/api/health`

---

## Project Structure

```
taskflow/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # 4 models + relations + cascade rules
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT verify — used on all protected routes
│   │   ├── routes/
│   │   │   ├── auth.js            # signup, login, /me
│   │   │   ├── projects.js        # CRUD + member management
│   │   │   ├── tasks.js           # CRUD + RBAC field restrictions
│   │   │   └── dashboard.js       # Aggregated stats
│   │   └── server.js              # Express app + static file serving
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/axios.js           # Axios instance + auth interceptor
│   │   ├── context/AuthContext.jsx # Global auth state
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── TaskCard.jsx       # Inline status update
│   │   │   ├── CreateProjectModal.jsx
│   │   │   ├── CreateTaskModal.jsx
│   │   │   └── AddMemberModal.jsx
│   │   └── pages/
│   │       ├── Dashboard.jsx      # Stats + charts
│   │       ├── ProjectDetail.jsx  # Kanban board
│   │       └── Docs.jsx           # Interactive API reference
│   └── vite.config.js
├── docs/screenshots/
│   ├── dashboard.png
│   └── project-management.png
├── railway.json
├── package.json
├── README.md                      # This file (renders with images on GitHub)
└── README.txt                     # Plain-text version for submission portals
```

---

## Security

| Concern | How It's Handled |
|---------|-----------------|
| Password storage | bcrypt with cost factor 10 — never stored/logged as plaintext |
| JWT secret | Environment variable — never hardcoded |
| User enumeration | Login returns identical error for wrong email vs wrong password |
| Input validation | express-validator on all mutation endpoints |
| SQL injection | Prisma ORM — no raw SQL anywhere |
| RBAC bypass | All permission checks are server-side database queries |
| Password in responses | Explicitly excluded from all Prisma `select` queries |
| CORS | Restricted to `FRONTEND_URL` in dev; same-origin in production |

---

## Testing Checklist

- [ ] Register two accounts (admin + member)
- [ ] Log in as admin → create project → admin auto-assigned
- [ ] Add member by email → member gets access
- [ ] Create 3 tasks with different priorities → color badges visible
- [ ] Set one task due date to yesterday → red overdue badge appears
- [ ] Log in as member → **only assigned task visible** (RBAC proof)
- [ ] As member: try to create a task → 403 from API
- [ ] As member: update own task status → succeeds
- [ ] Dashboard shows correct aggregated stats
- [ ] `GET /api/health` → `{ "status": "ok" }`
- [ ] Visit `/docs` → all endpoints listed with details

---

## Scripts

```bash
npm run install:all    # Install backend + frontend dependencies
npm run build          # Build React into backend/public
npm start              # Start production server
npm run dev:backend    # Start backend dev server (port 3001)
npm run dev:frontend   # Start Vite dev server (port 5173)
```

---

## License

MIT — free to use, modify, and distribute.

---

<p align="center">
  Built with Node.js · Express · Prisma · PostgreSQL · React · Vite · Tailwind CSS
  <br/>
  Deployed on Railway · Database on Supabase
</p>
