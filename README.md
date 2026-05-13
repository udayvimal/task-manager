# TaskFlow — Team Task Management Application

> A production-grade, full-stack collaborative task management platform built with Node.js, React, and PostgreSQL. Manage projects, assign tasks, track progress, and collaborate with your team — all in one place.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://your-app.railway.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/yourusername/taskflow)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## 📸 Screenshots

> **Note:** Replace the placeholder links below with your actual deployed screenshots.

| Dashboard | Project Board | API Docs |
|-----------|--------------|----------|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Board](docs/screenshots/board.png) | ![Docs](docs/screenshots/docs.png) |

---

## 🎥 Demo Video

> **[▶ Watch the 4-minute walkthrough on Loom / YouTube](https://your-video-link-here)**
> 
> The demo covers: signup, creating a project, adding team members, creating & assigning tasks, updating task status as a member, and the live dashboard analytics.

---

## ✨ Features

### Core Functionality
- **JWT Authentication** — Secure signup/login with bcrypt-hashed passwords and 7-day tokens
- **Project Management** — Create projects; creator automatically becomes Admin; invite members by email
- **Kanban Task Board** — Visual To Do / In Progress / Done columns per project
- **Role-Based Access Control (RBAC)**
  - **Admin**: Full CRUD on tasks, members, and the project itself
  - **Member**: Can view assigned tasks and update their status only
- **Real-time Dashboard** — Aggregated stats: total tasks, tasks by status, tasks by priority, tasks per user, overdue tasks
- **Overdue Detection** — Tasks past their due date are visually flagged
- **Priority Levels** — Low / Medium / High with color-coded badges
- **API Documentation** — In-app interactive `/docs` page with all endpoints
- **Health Check** — `/api/health` endpoint for uptime monitoring

### Technical Highlights
- RESTful API design with proper HTTP status codes
- Prisma ORM with cascade deletes for data integrity
- Request validation via `express-validator`
- Axios interceptors for auth header injection and 401 auto-logout
- React Context API for global auth state
- Protected routes with redirect logic
- Responsive design with Tailwind CSS
- Environment-based configuration for dev/prod parity

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6 |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (via Supabase) |
| **ORM** | Prisma |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **Validation** | express-validator |
| **Deployment** | Railway (backend + static frontend) |
| **DB Hosting** | Supabase (free tier) |

---

## 📐 Architecture

```
┌─────────────────────────────────────────────┐
│                  Railway                     │
│  ┌──────────────────────────────────────┐   │
│  │         Express.js Server            │   │
│  │  ┌──────────┐  ┌──────────────────┐  │   │
│  │  │  /api/*  │  │  Static React    │  │   │
│  │  │  Routes  │  │  Build (/public) │  │   │
│  │  └────┬─────┘  └──────────────────┘  │   │
│  └───────┼──────────────────────────────┘   │
└──────────┼──────────────────────────────────┘
           │ Prisma ORM
           ▼
┌─────────────────┐
│    Supabase     │
│   PostgreSQL    │
└─────────────────┘
```

**Request Flow:**
1. Browser → Express `/api/*` → Route handler → Prisma → PostgreSQL
2. Browser → Express `*` → Serve `frontend/dist/index.html` → React SPA

---

## 🗃 Database Schema

```
User ──< ProjectMember >── Project
                               │
                               └──< Task >── User (assignedTo)
```

| Table | Key Fields |
|-------|-----------|
| `User` | id, name, email, password (hashed) |
| `Project` | id, name, description, createdById |
| `ProjectMember` | projectId, userId, role (admin\|member) |
| `Task` | id, title, description, dueDate, priority, status, projectId, assignedToId |

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- PostgreSQL database (or a free [Supabase](https://supabase.com) project)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow
```

### 2. Install dependencies
```bash
# Install both backend and frontend dependencies
npm run install:all
```

### 3. Configure environment variables
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

> **Supabase users:** Go to Project Settings → Database → URI and copy the connection string.

### 4. Run database migrations
```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
cd ..
```

### 5. Start development servers

In two separate terminals:
```bash
# Terminal 1 — Backend (port 3001)
npm run dev:backend

# Terminal 2 — Frontend (port 5173, proxies /api to backend)
npm run dev:frontend
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📦 Production Build

```bash
# Build frontend into backend/public
npm run build

# Start the server (serves both API and frontend)
NODE_ENV=production npm start
```

---

## 🚂 Railway Deployment (Step-by-Step)

### 1. Set up Supabase
1. Go to [supabase.com](https://supabase.com) → New Project
2. Navigate to **Settings → Database → Connection string → URI**
3. Copy the connection string (replace `[YOUR-PASSWORD]` with your DB password)

### 2. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/taskflow.git
git push -u origin main
```

### 3. Deploy on Railway
1. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub Repo**
2. Select your `taskflow` repository
3. Railway auto-detects `railway.json` — no manual config needed
4. Go to **Variables** tab and add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Supabase PostgreSQL URI |
| `JWT_SECRET` | A strong random string (32+ chars) |
| `NODE_ENV` | `production` |
| `PORT` | `3001` (or leave blank; Railway sets this) |

5. Click **Deploy** — Railway builds frontend, installs backend deps, runs Prisma migrate, and starts the server
6. Go to **Settings → Networking → Generate Domain** to get your public URL

---

## 🔌 API Reference

Visit the live `/docs` page in the app for the full interactive API reference.

### Quick Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/signup` | ❌ | Register new user |
| `POST` | `/api/auth/login` | ❌ | Login and get JWT |
| `GET` | `/api/auth/me` | ✅ | Get current user |
| `GET` | `/api/projects` | ✅ | List user's projects |
| `POST` | `/api/projects` | ✅ | Create project |
| `GET` | `/api/projects/:id` | ✅ | Project details + tasks + members |
| `POST` | `/api/projects/:id/members` | ✅ Admin | Add member by email |
| `DELETE` | `/api/projects/:id/members/:userId` | ✅ Admin | Remove member |
| `GET` | `/api/tasks?projectId=...` | ✅ | List tasks (role-filtered) |
| `POST` | `/api/tasks` | ✅ Admin | Create task |
| `PUT` | `/api/tasks/:id` | ✅ | Update task (role-restricted) |
| `DELETE` | `/api/tasks/:id` | ✅ Admin | Delete task |
| `GET` | `/api/dashboard` | ✅ | Aggregated stats |
| `GET` | `/api/health` | ❌ | Health check |

---

## 🔐 Role Permissions

| Action | Admin | Member |
|--------|-------|--------|
| Create / delete project | ✅ | ❌ |
| Add / remove members | ✅ | ❌ |
| Create / delete tasks | ✅ | ❌ |
| Edit all task fields | ✅ | ❌ |
| Update own task status | ✅ | ✅ |
| View all project tasks | ✅ | ❌ |
| View own assigned tasks | ✅ | ✅ |
| View dashboard | ✅ | ✅ |

---

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database models & relations
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT verification middleware
│   │   ├── routes/
│   │   │   ├── auth.js            # /api/auth/*
│   │   │   ├── projects.js        # /api/projects/*
│   │   │   ├── tasks.js           # /api/tasks/*
│   │   │   └── dashboard.js       # /api/dashboard
│   │   └── server.js              # Express app entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/axios.js           # Axios instance + interceptors
│   │   ├── context/AuthContext.jsx # Global auth state
│   │   ├── components/
│   │   │   ├── Layout.jsx         # Sidebar + navigation shell
│   │   │   ├── TaskCard.jsx       # Task card with inline status update
│   │   │   ├── CreateProjectModal.jsx
│   │   │   ├── CreateTaskModal.jsx
│   │   │   └── AddMemberModal.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx      # Stats & charts
│   │   │   ├── Projects.jsx       # Project grid
│   │   │   ├── ProjectDetail.jsx  # Kanban board
│   │   │   └── Docs.jsx           # Interactive API reference
│   │   ├── App.jsx                # Route definitions
│   │   └── main.jsx
│   └── vite.config.js
├── railway.json                   # Railway deployment config
├── package.json                   # Root scripts
└── README.md
```

---

## 🧪 Testing the Application

### Walkthrough Checklist
- [ ] Register two user accounts (e.g., admin@test.com and member@test.com)
- [ ] Log in as admin → Create a project
- [ ] Add member@test.com as a Member to the project
- [ ] Create 3 tasks with different priorities, assign one to the member
- [ ] Log in as member → Verify they only see their assigned task
- [ ] Update task status as member → Verify it updates on the board
- [ ] Log back in as admin → Verify the dashboard shows correct stats
- [ ] Check `/api/health` returns `{ "status": "ok" }`
- [ ] Visit `/docs` for the interactive API reference

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">Built with ❤️ using React, Express, Prisma, and PostgreSQL</p>
