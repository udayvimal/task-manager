================================================================================
  TASKFLOW — Production-Grade Collaborative Task Management Platform
================================================================================

  Full-Stack | Node.js + React + PostgreSQL | JWT Auth | RBAC | Live on Railway
  Author  : Ayush
  Date    : May 2026
  Live URL: https://task-manager-production-0aaa.up.railway.app/login
  GitHub  : https://github.com/yourusername/taskflow

================================================================================
  QUICK PITCH  (read this first)
================================================================================

TaskFlow is a production-ready, multi-user team task management application
built entirely from scratch in a single sprint. It supports:

  - Secure JWT authentication with bcrypt-hashed passwords
  - Project-level Role-Based Access Control (Admin vs Member) — enforced on
    the SERVER, not just hidden in the UI
  - Kanban board (To Do / In Progress / Done) per project
  - Team member management (add by email, remove, role-scoped visibility)
  - Real-time dashboard with aggregated stats, overdue detection, priority
    breakdown, and per-user task distribution
  - Fully deployed on Railway — one URL, zero CORS issues, zero extra cost

This is not a tutorial clone. Every architectural decision was made deliberately
and can be defended. See "DESIGN DECISIONS" section below for the full reasoning.

================================================================================
  SCREENSHOTS
================================================================================

  docs/screenshots/dashboard.png
    → Analytics dashboard showing task breakdown by status, priority, per-user
      distribution, and overdue count. Visible to all project members.

  docs/screenshots/project-management.png
    → Kanban board view of a project with To Do / In Progress / Done columns,
      priority badges, assignee info, and overdue task highlighting.

  Live app: https://task-manager-production-0aaa.up.railway.app/login

================================================================================
  LIVE DEMO WALKTHROUGH
================================================================================

Steps to evaluate the full feature set on the live deployment:

  STEP 1 — Register two accounts
    Go to /register
    Account A: admin@demo.com  / password123    (will be the project Admin)
    Account B: member@demo.com / password123    (will be a project Member)

  STEP 2 — Create a project (logged in as Admin)
    Click "New Project" → name it "Alpha Sprint"
    The creator is automatically assigned the Admin role.

  STEP 3 — Add a team member
    Inside "Alpha Sprint" → Members tab → "Add Member"
    Enter member@demo.com → role: Member
    The member now has access to the project.

  STEP 4 — Create tasks (as Admin)
    Create 3 tasks:
      Task 1: "Design homepage"    Priority: High    Assign to: member@demo.com
      Task 2: "Write API docs"     Priority: Medium  Assign to: admin@demo.com
      Task 3: "Fix login bug"      Priority: Low     Due: yesterday (overdue!)

  STEP 5 — Log in as Member, verify RBAC
    Log out → Log in as member@demo.com
    You will see ONLY "Design homepage" (their assigned task)
    They CANNOT create tasks, delete tasks, or see other members' tasks
    They CAN update the status of their own task (To Do → In Progress → Done)

  STEP 6 — Check the Dashboard
    Click "Dashboard" in the sidebar
    See: total tasks, breakdown by status, by priority, overdue count,
         tasks-per-user bar chart

  STEP 7 — Verify the health endpoint
    GET https://your-app.railway.app/api/health
    Response: { "status": "ok", "timestamp": "..." }

  STEP 8 — Browse the API Docs
    Navigate to /docs in the app → full interactive endpoint reference

================================================================================
  FEATURES — COMPLETE LIST WITH PROOF
================================================================================

[AUTH]
  ✔ POST /api/auth/signup   — Validates input, hashes password with bcrypt(10),
                              returns JWT. Duplicate email returns 400.
  ✔ POST /api/auth/login    — Verifies bcrypt hash, never returns raw password.
                              Wrong credentials return 401 (not 404, to prevent
                              user enumeration).
  ✔ GET  /api/auth/me       — Protected route, returns current user from token.
  ✔ JWT 7-day expiry        — Configured in auth.js: { expiresIn: '7d' }
  ✔ Axios interceptor       — Auto-injects Bearer token on every request;
                              auto-redirects to /login on 401.

[PROJECTS]
  ✔ Create project          — Creator auto-assigned Admin role via ProjectMember
  ✔ List user's projects    — Only projects where caller is a member
  ✔ Project detail          — Returns project + all tasks + all members in one call
  ✔ Add member by email     — Admin only; looks up user by email, creates
                              ProjectMember record
  ✔ Remove member           — Admin only; cannot remove yourself if you're the
                              only admin

[TASKS]
  ✔ Create task             — Admin only. Supports title, description, due date,
                              priority (low/medium/high), assignedToId
  ✔ List tasks              — Role-filtered: admins see all, members see only
                              their assigned tasks. Enforced with Prisma WHERE
                              clause server-side.
  ✔ Update task             — Admin: update any field. Member: update status only
                              (enforced on the API, not just UI).
  ✔ Delete task             — Admin only
  ✔ Overdue detection       — Frontend compares task.dueDate with Date.now();
                              overdue tasks get a red badge
  ✔ Cascade delete          — Deleting a project deletes all tasks + memberships
                              automatically (Prisma onDelete: Cascade)

[DASHBOARD]
  ✔ GET /api/dashboard      — Returns in a single query:
                              total tasks, count by status, count by priority,
                              tasks per user (with names), overdue count
  ✔ Frontend charts         — Bar charts for status, priority, per-user distribution

[DEVOPS & DEPLOYMENT]
  ✔ Single Railway service  — Express serves React build as static files in
                              production. One URL, no CORS, no second service.
  ✔ Supabase PostgreSQL     — Free hosted DB, Prisma-compatible connection string
  ✔ Health check endpoint   — GET /api/health for uptime monitors
  ✔ railway.json            — Zero-config Railway deployment
  ✔ .env.example            — All environment variables documented
  ✔ Prisma migrations       — Schema changes are versioned and reproducible

================================================================================
  TECH STACK
================================================================================

  Layer          Technology              Why This Choice
  ─────────────────────────────────────────────────────────────────────────
  Backend        Node.js + Express       Fast to build, vast ecosystem,
                                        production-proven for REST APIs
  ORM            Prisma                  Type-safe queries, auto migrations,
                                        cascade deletes out of the box
  Database       PostgreSQL (Supabase)   Relational model fits project/task/
                                        member relationships perfectly
  Auth           JWT + bcryptjs          Stateless (no Redis needed), bcrypt
                                        cost factor 10 (industry standard)
  Validation     express-validator       Declarative, chainable, prevents XSS
                                        and bad data at the boundary
  Frontend       React 18 + Vite         Fast HMR, modern JSX, component model
  Routing        React Router v6         Nested routes, protected route patterns
  State          React Context API       Right-sized for this scope; no Redux
                                        overhead
  Styling        Tailwind CSS            No custom CSS files, consistent system,
                                        responsive by default
  HTTP Client    Axios                   Interceptors for auth injection + 401
                                        handling in one place
  Deployment     Railway                 Git-push deploys, Node.js native support,
                                        free tier covers this scope
  DB Hosting     Supabase                Free PostgreSQL, no credit card, Prisma
                                        connection string ready

================================================================================
  ARCHITECTURE
================================================================================

                    ┌──────────────────────────────────────┐
                    │            Railway Server             │
                    │                                       │
                    │   ┌─────────────────────────────┐    │
                    │   │       Express.js App         │    │
                    │   │                              │    │
                    │   │  ┌──────────┐  ┌──────────┐  │    │
                    │   │  │ /api/*   │  │ Static   │  │    │
                    │   │  │ Routes   │  │ React    │  │    │
                    │   │  │          │  │ Build    │  │    │
                    │   │  └────┬─────┘  └──────────┘  │    │
                    │   └───────┼──────────────────────┘    │
                    └───────────┼──────────────────────────-┘
                                │ Prisma ORM
                                ▼
                    ┌────────────────────┐
                    │      Supabase      │
                    │   PostgreSQL DB    │
                    └────────────────────┘

  Request flow:
    API request  → Express /api/* → Route handler → auth middleware
                 → Role check → Prisma query → PostgreSQL → JSON response

    Page request → Express * catch-all → Serve frontend/dist/index.html
                 → React SPA takes over → React Router renders the page

  Why single-service?
    Two separate services = two separate domains = CORS configuration.
    CORS configuration = a surface area for bugs, mistakes, and demo failures.
    Serving the React build from the same Express server eliminates this entirely.
    One domain, one SSL cert, one Railway service = simpler, cheaper, more robust.

================================================================================
  DATABASE SCHEMA
================================================================================

  User ──────< ProjectMember >────── Project
                                         │
                                         └──────< Task >── User (assignedTo)

  ┌─────────────────────────────────────────────────────────────────────────┐
  │ User                                                                    │
  │   id         String  (cuid)  PRIMARY KEY                               │
  │   name       String                                                     │
  │   email      String          UNIQUE                                     │
  │   password   String          bcrypt hash — NEVER stored as plaintext   │
  │   createdAt  DateTime                                                   │
  └─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────┐
  │ Project                                                                 │
  │   id            String  (cuid)  PRIMARY KEY                            │
  │   name          String                                                  │
  │   description   String?                                                 │
  │   createdById   String          FK → User                              │
  │   createdAt     DateTime                                                │
  └─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────┐
  │ ProjectMember  (junction table — holds the role, not just the link)    │
  │   id         String  (cuid)  PRIMARY KEY                               │
  │   projectId  String          FK → Project  (onDelete: Cascade)        │
  │   userId     String          FK → User     (onDelete: Cascade)        │
  │   role       String          "admin" | "member"  default: "member"    │
  │   UNIQUE (projectId, userId) — one membership record per user/project  │
  └─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────┐
  │ Task                                                                    │
  │   id            String    (cuid)  PRIMARY KEY                          │
  │   title         String                                                  │
  │   description   String?                                                 │
  │   dueDate       DateTime?                                               │
  │   priority      String    "low" | "medium" | "high"  default: medium   │
  │   status        String    "todo" | "inprogress" | "done"  default: todo│
  │   projectId     String    FK → Project  (onDelete: Cascade)           │
  │   assignedToId  String?   FK → User     (nullable — unassigned tasks) │
  │   createdById   String    FK → User                                    │
  │   createdAt     DateTime                                                │
  └─────────────────────────────────────────────────────────────────────────┘

  KEY DESIGN DECISION — Why ProjectMember instead of a role column on User?
    A User is an Admin on Project A but a Member on Project B. A global role
    column on User can't express this. The junction table ProjectMember holds
    the role PER project, which is the correct relational model. This is what
    real production systems like Jira, Linear, and Notion use.

================================================================================
  ROLE-BASED ACCESS CONTROL (RBAC)
================================================================================

  IMPORTANT: All permissions are enforced server-side in route handlers.
  Hiding a button in React is NOT security. Every restricted action verifies
  the caller's role via a database query before executing.

  Action                          Admin   Member
  ──────────────────────────────────────────────
  Create project                    YES     NO
  Delete project                    YES     NO
  Add team members                  YES     NO
  Remove team members               YES     NO
  Create task                       YES     NO
  Delete task                       YES     NO
  Update any task field             YES     NO
  Update own task status only       YES     YES
  View all project tasks            YES     NO
  View own assigned tasks only      YES     YES
  View dashboard stats              YES     YES
  View project member list          YES     YES

  HOW IT IS ENFORCED IN CODE:

    1. Every protected route calls the auth middleware first:
         const membership = await prisma.projectMember.findUnique({
           where: { projectId_userId: { projectId, userId } }
         });

    2. Admin-only routes check:
         if (membership.role !== 'admin')
           return res.status(403).json({ error: 'Admin access required' });

    3. Task listing is role-filtered at the Prisma query level:
         const where = { projectId };
         if (membership.role === 'member') {
           where.assignedToId = req.userId;  // Members only see their tasks
         }

    4. Task update is field-filtered by role:
         const updateData = isAdmin
           ? { title, description, dueDate, priority, status, assignedToId }
           : { status };  // Members can ONLY update status field

================================================================================
  API REFERENCE — COMPLETE ENDPOINT LIST
================================================================================

  BASE URL: https://your-app.railway.app/api
  Auth: Pass JWT in header: Authorization: Bearer <token>

  ── AUTHENTICATION ─────────────────────────────────────────────────────────

  POST /auth/signup
    Body:   { "name": "Alice", "email": "alice@co.com", "password": "abc123" }
    200:    { "token": "eyJ...", "user": { "id", "name", "email" } }
    400:    { "errors": [...] }   — validation failed or email already taken

  POST /auth/login
    Body:   { "email": "alice@co.com", "password": "abc123" }
    200:    { "token": "eyJ...", "user": { "id", "name", "email", "createdAt" } }
    401:    { "error": "Invalid credentials" }

  GET /auth/me                                        [AUTH REQUIRED]
    200:    { "id", "name", "email", "createdAt" }

  ── PROJECTS ───────────────────────────────────────────────────────────────

  GET /projects                                       [AUTH REQUIRED]
    Returns all projects where the caller is a member (any role).
    200:    [ { "id", "name", "description", "createdAt", "members": [...] } ]

  POST /projects                                      [AUTH REQUIRED]
    Body:   { "name": "Q3 Sprint", "description": "optional" }
    201:    { project object }
    Note:   Creator is automatically added as Admin.

  GET /projects/:id                                   [AUTH REQUIRED, MEMBER+]
    Returns project + tasks (role-filtered) + members list.
    200:    { "project": {...}, "tasks": [...], "members": [...] }
    403:    Not a member of this project

  POST /projects/:id/members                          [AUTH REQUIRED, ADMIN]
    Body:   { "email": "bob@co.com", "role": "member" }
    201:    { membership object }
    404:    User not found

  DELETE /projects/:id/members/:userId                [AUTH REQUIRED, ADMIN]
    200:    { "message": "Member removed" }

  ── TASKS ──────────────────────────────────────────────────────────────────

  GET /tasks?projectId=<id>                           [AUTH REQUIRED, MEMBER+]
    Admin:  Returns all tasks in project
    Member: Returns only tasks assigned to caller
    200:    [ { "id", "title", "status", "priority", "dueDate",
                "assignedTo": {...}, "createdBy": {...} } ]

  POST /tasks                                         [AUTH REQUIRED, ADMIN]
    Body:   {
              "title": "Fix bug",
              "description": "optional",
              "dueDate": "2026-06-01T00:00:00.000Z",   (optional, ISO 8601)
              "priority": "high",                       (low|medium|high)
              "projectId": "clxyz...",
              "assignedToId": "clxyz..."                (optional)
            }
    201:    { task object with assignedTo and createdBy }
    400:    Validation errors
    403:    Not admin

  PUT /tasks/:id                                      [AUTH REQUIRED]
    Admin:  Can update title, description, dueDate, priority, status, assignedToId
    Member: Can ONLY update status field; all other fields ignored
    200:    { updated task object }
    403:    Not authorized (not admin AND not the assignee)
    404:    Task not found

  DELETE /tasks/:id                                   [AUTH REQUIRED, ADMIN]
    200:    { "message": "Task deleted" }
    403:    Not admin
    404:    Task not found

  ── DASHBOARD ──────────────────────────────────────────────────────────────

  GET /dashboard                                      [AUTH REQUIRED]
    Returns aggregate stats across all user's projects.
    200:    {
              "totalTasks": 12,
              "byStatus": { "todo": 5, "inprogress": 4, "done": 3 },
              "byPriority": { "high": 3, "medium": 6, "low": 3 },
              "overdueCount": 2,
              "tasksByUser": [
                { "user": { "name": "Alice" }, "count": 7 },
                { "user": { "name": "Bob" },   "count": 5 }
              ]
            }

  ── HEALTH ─────────────────────────────────────────────────────────────────

  GET /health                                         [PUBLIC]
    200:    { "status": "ok", "timestamp": "2026-05-14T10:00:00.000Z" }

================================================================================
  LOCAL SETUP — STEP BY STEP
================================================================================

  PREREQUISITES
    - Node.js v18 or higher
    - A PostgreSQL database
      Option A: Free Supabase project (recommended — no install needed)
                  1. Go to supabase.com → New Project
                  2. Settings → Database → Connection string → URI
                  3. Copy: postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres
      Option B: Local PostgreSQL installation

  STEP 1 — Clone the repository
    git clone https://github.com/yourusername/taskflow.git
    cd taskflow

  STEP 2 — Install all dependencies (backend + frontend)
    npm run install:all

  STEP 3 — Configure environment variables
    cp backend/.env.example backend/.env

    Edit backend/.env:
      DATABASE_URL="postgresql://user:password@host:5432/taskmanager"
      JWT_SECRET="minimum-32-character-random-secret-here"
      PORT=3001
      NODE_ENV=development
      FRONTEND_URL="http://localhost:5173"

  STEP 4 — Run database migrations
    cd backend
    npx prisma migrate dev --name init
    npx prisma generate
    cd ..

    This creates all tables (User, Project, ProjectMember, Task) with proper
    indexes, constraints, and cascade rules.

  STEP 5 — Start development servers (two terminals)

    Terminal 1 — Backend (runs on port 3001):
      npm run dev:backend

    Terminal 2 — Frontend (runs on port 5173):
      npm run dev:frontend

    Open: http://localhost:5173

    The Vite dev server proxies /api/* to port 3001, so no CORS issues in dev.

================================================================================
  PRODUCTION BUILD
================================================================================

  Build the React app into backend/public:
    npm run build

  Start the production server (serves both API + frontend):
    NODE_ENV=production npm start

  The server automatically serves frontend/dist/index.html for any non-/api route,
  enabling full client-side routing without a separate web server.

================================================================================
  RAILWAY DEPLOYMENT (STEP-BY-STEP)
================================================================================

  STEP 1 — Set up Supabase database
    1. supabase.com → New Project → choose a region
    2. Settings → Database → Connection String → URI
    3. Copy the URI (replace [YOUR-PASSWORD] with your actual DB password)

  STEP 2 — Push code to GitHub
    git init
    git add .
    git commit -m "Initial commit"
    git remote add origin https://github.com/yourusername/taskflow.git
    git push -u origin main

  STEP 3 — Create Railway project
    1. railway.app → New Project → Deploy from GitHub Repo
    2. Select your taskflow repository
    3. Railway detects railway.json automatically — no manual config needed

  STEP 4 — Set environment variables in Railway
    Go to your service → Variables tab → Add these:

    Variable         Value
    ─────────────────────────────────────────────────────────
    DATABASE_URL     postgresql://... (your Supabase URI)
    JWT_SECRET       a-strong-random-string-min-32-chars
    NODE_ENV         production
    PORT             (leave blank — Railway sets this automatically)

  STEP 5 — Run database migration
    In Railway → your service → Shell tab (or via Railway CLI):
      cd backend && npx prisma migrate deploy

  STEP 6 — Get your public URL
    Railway → Settings → Networking → Generate Domain
    Your app is live at: https://your-app.railway.app

  STEP 7 — Verify deployment
    GET https://task-manager-production-0aaa.up.railway.app/api/health
    Expected: { "status": "ok" }

================================================================================
  PROJECT STRUCTURE
================================================================================

  taskflow/
  ├── backend/
  │   ├── prisma/
  │   │   └── schema.prisma          ← All 4 database models + relations
  │   ├── src/
  │   │   ├── middleware/
  │   │   │   └── auth.js            ← JWT verify middleware (used on all
  │   │   │                             protected routes)
  │   │   ├── routes/
  │   │   │   ├── auth.js            ← POST /signup, POST /login, GET /me
  │   │   │   ├── projects.js        ← CRUD projects + member management
  │   │   │   ├── tasks.js           ← CRUD tasks with RBAC enforcement
  │   │   │   └── dashboard.js       ← Aggregated stats endpoint
  │   │   └── server.js              ← Express app, static file serving,
  │   │                                 route mounting, health check
  │   ├── .env.example               ← All required env vars documented
  │   └── package.json
  │
  ├── frontend/
  │   ├── src/
  │   │   ├── api/
  │   │   │   └── axios.js           ← Axios instance with auth interceptor
  │   │   ├── context/
  │   │   │   └── AuthContext.jsx    ← Global auth state + token storage
  │   │   ├── components/
  │   │   │   ├── Layout.jsx         ← Sidebar + navigation shell
  │   │   │   ├── TaskCard.jsx       ← Task card with inline status update
  │   │   │   ├── CreateProjectModal.jsx
  │   │   │   ├── CreateTaskModal.jsx
  │   │   │   └── AddMemberModal.jsx
  │   │   ├── pages/
  │   │   │   ├── Login.jsx
  │   │   │   ├── Register.jsx
  │   │   │   ├── Dashboard.jsx      ← Stats + charts
  │   │   │   ├── Projects.jsx       ← Project grid
  │   │   │   ├── ProjectDetail.jsx  ← Kanban board (3-column)
  │   │   │   └── Docs.jsx           ← Interactive API reference page
  │   │   ├── App.jsx                ← Route definitions + protected routes
  │   │   └── main.jsx
  │   └── vite.config.js             ← Proxy config for dev; outDir for prod
  │
  ├── railway.json                   ← Railway deployment config
  ├── package.json                   ← Root scripts (install:all, build, start)
  ├── .gitignore
  ├── APPROACH.txt                   ← Design decisions and thought process
  └── README.txt                     ← This file

================================================================================
  DESIGN DECISIONS & ENGINEERING CHOICES
================================================================================

  DECISION 1 — Single-service deployment
    Problem:  Two separate Railway services (frontend + backend) require CORS
              configuration. CORS bugs are the #1 cause of hackathon demo failures.
    Solution: Vite builds the React app into backend/public. Express serves that
              directory as static files in production and falls back to index.html
              for client-side routes. One URL. Zero CORS.

  DECISION 2 — RBAC enforced on the API, not the UI
    Problem:  Any developer can open DevTools, find the API endpoint, and call it
              with curl. If RBAC only hides buttons in React, it's not security.
    Solution: Every sensitive route queries the ProjectMember table before acting.
              Members literally cannot create tasks even if they call the API
              directly — the server returns 403 before any DB write occurs.

  DECISION 3 — ProjectMember junction table for roles
    Problem:  A user can be Admin on Project A and Member on Project B. A role
              column on the User table is a global role — wrong model.
    Solution: ProjectMember holds role per (project, userId) pair. This is how
              Jira, Linear, and Notion model it. The @@unique([projectId, userId])
              constraint ensures no duplicate memberships.

  DECISION 4 — JWT over sessions
    Problem:  Sessions need server-side storage (Redis or DB). That's infrastructure
              complexity for a REST API.
    Solution: Stateless JWT. Server validates signature, no lookup needed. 7-day
              expiry balances UX vs. security. Axios interceptor handles 401s.

  DECISION 5 — bcrypt with cost factor 10
    Problem:  Password storage. MD5 and SHA hashes are fast — that's bad for
              passwords because brute force is fast too.
    Solution: bcrypt is slow by design. Cost factor 10 is the OWASP-recommended
              minimum. Each hash takes ~100ms, making brute force infeasible.

  DECISION 6 — express-validator at every public route
    Problem:  Unvalidated input leads to crashes, SQL injection risks, bad data.
    Solution: All mutation endpoints declare validation chains. validationResult()
              short-circuits before any DB operation if input is invalid.

  DECISION 7 — Prisma onDelete: Cascade
    Problem:  Deleting a project must clean up all tasks and memberships. Manual
              delete sequences are error-prone and can leave orphan records.
    Solution: Declared at schema level: onDelete: Cascade on all FKs pointing to
              Project. One prisma.project.delete() cleans everything atomically.

================================================================================
  SECURITY CONSIDERATIONS
================================================================================

  ✔ Passwords hashed with bcrypt (cost 10) — never stored or logged as plaintext
  ✔ JWT secret stored in environment variable — never hardcoded
  ✔ Login endpoint returns identical error for wrong email vs wrong password
    (prevents user enumeration attacks)
  ✔ Password field explicitly excluded from all Prisma select queries
  ✔ express-validator sanitizes all user input (trims, normalizes email, etc.)
  ✔ All protected routes validate token before any DB access
  ✔ RBAC checks use database queries, not client-supplied role claims
  ✔ No raw SQL — Prisma prevents SQL injection by design
  ✔ CORS restricted to FRONTEND_URL in development; same-origin in production

================================================================================
  KNOWN LIMITATIONS & FUTURE ROADMAP
================================================================================

  Limitations (honest, by design for this scope):
    - No real-time updates — page refresh required to see others' changes
    - No file attachments on tasks
    - No pagination (assumes < 500 tasks per project for now)
    - JWT is not revocable — logout only clears client token, not server-side
    - No email verification on signup

  Roadmap (what I'd add with more time):
    1. WebSockets (Socket.io) for real-time board updates
    2. Email notifications for task assignment (via Resend or SendGrid)
    3. Refresh token rotation for better auth security
    4. Full test suite: Jest + Supertest (API), Vitest + RTL (components)
    5. File uploads via Supabase Storage
    6. Admin ability to change member roles after adding
    7. Dark mode
    8. Pagination with cursor-based navigation

================================================================================
  DEPENDENCIES
================================================================================

  BACKEND (backend/package.json)
    express            — Web framework
    @prisma/client     — Type-safe DB client
    prisma             — ORM + migration CLI (devDependency)
    jsonwebtoken       — JWT sign and verify
    bcryptjs           — Password hashing (pure JS, no native bindings)
    express-validator  — Input validation and sanitization
    cors               — CORS middleware
    dotenv             — Environment variable loading
    nodemon            — Dev server auto-restart (devDependency)

  FRONTEND (frontend/package.json)
    react              — UI library
    react-dom          — React DOM renderer
    react-router-dom   — Client-side routing (v6)
    axios              — HTTP client with interceptors
    @vitejs/plugin-react — Vite React plugin
    vite               — Build tool and dev server
    tailwindcss        — Utility-first CSS framework
    autoprefixer       — CSS vendor prefixing

================================================================================
  TESTING THE APPLICATION
================================================================================

  Full walkthrough checklist — go through this before demoing:

  AUTH
    [ ] Register with a new email → token returned → redirected to dashboard
    [ ] Register with same email again → 400 error
    [ ] Login with wrong password → 401 error
    [ ] Log out → localStorage cleared → redirected to login
    [ ] Paste a protected URL while logged out → redirected to login

  PROJECTS
    [ ] Create a project → appears in project grid
    [ ] Creator is shown as Admin in member list
    [ ] Add a second user as Member by email
    [ ] User not found → shows error
    [ ] Remove a member → they lose access

  TASKS (as Admin)
    [ ] Create task with all fields → appears in "To Do" column
    [ ] Create task with due date in the past → shows red "Overdue" badge
    [ ] Create high/medium/low priority tasks → color-coded badges visible
    [ ] Update task status → moves to correct column
    [ ] Assign task to member
    [ ] Delete task → removed from board

  TASKS (as Member)
    [ ] Log in as member → only see assigned tasks
    [ ] Try to create a task → button not visible (and API returns 403)
    [ ] Update own task status → works
    [ ] Try to update task title via PUT /api/tasks/:id with all fields →
        only status updates, other fields ignored

  DASHBOARD
    [ ] Stats reflect actual task counts
    [ ] Overdue count matches tasks past due date
    [ ] Per-user chart shows all members

  API
    [ ] GET /api/health → { "status": "ok" }
    [ ] GET /api/auth/me with valid token → user object
    [ ] GET /api/auth/me with no token → 401
    [ ] GET /api/auth/me with expired/invalid token → 401

================================================================================
  ENVIRONMENT VARIABLES REFERENCE
================================================================================

  Variable         Required   Description
  ─────────────────────────────────────────────────────────────────────────────
  DATABASE_URL     YES        PostgreSQL connection string
                              Format: postgresql://user:pass@host:port/dbname
  JWT_SECRET       YES        Secret for signing JWTs. Min 32 chars.
                              Generate: node -e "console.log(require('crypto')
                              .randomBytes(32).toString('hex'))"
  PORT             NO         Server port. Defaults to 3001. Railway sets this.
  NODE_ENV         NO         "development" or "production"
  FRONTEND_URL     NO         Used for CORS in development. Not needed in prod
                              since frontend is served from same origin.

================================================================================
  SCRIPTS REFERENCE
================================================================================

  From the project root (taskflow/):

    npm run install:all      Install backend + frontend dependencies
    npm run build            Build React frontend into backend/public
    npm start                Start production server
    npm run dev:backend      Start backend dev server (nodemon, port 3001)
    npm run dev:frontend     Start Vite dev server (port 5173, proxies /api)

  From backend/:
    npx prisma migrate dev   Apply migrations in development
    npx prisma migrate deploy Apply migrations in production (Railway)
    npx prisma generate      Regenerate Prisma client after schema changes
    npx prisma studio        Open visual database browser

================================================================================
  LICENSE
================================================================================

  MIT License — free to use, modify, and distribute.

================================================================================
  BUILT WITH
================================================================================

  Node.js  •  Express  •  Prisma  •  PostgreSQL  •  React  •  Vite
  Tailwind CSS  •  JWT  •  bcrypt  •  Railway  •  Supabase

  Every line written from scratch. No boilerplate generators. No starter kits.

================================================================================
