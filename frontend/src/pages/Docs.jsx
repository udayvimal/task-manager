import { useState } from 'react';

const endpoints = [
  {
    group: 'Auth',
    color: 'bg-green-100 text-green-700',
    routes: [
      { method: 'POST', path: '/api/auth/signup', desc: 'Register a new user', body: '{ name, email, password }', response: '{ token, user }', auth: false },
      { method: 'POST', path: '/api/auth/login', desc: 'Authenticate and get JWT token', body: '{ email, password }', response: '{ token, user }', auth: false },
      { method: 'GET', path: '/api/auth/me', desc: 'Get current authenticated user', body: '—', response: '{ id, name, email, createdAt }', auth: true },
    ],
  },
  {
    group: 'Projects',
    color: 'bg-blue-100 text-blue-700',
    routes: [
      { method: 'GET', path: '/api/projects', desc: "List all projects user belongs to", body: '—', response: 'Project[]', auth: true },
      { method: 'POST', path: '/api/projects', desc: 'Create a new project (caller becomes admin)', body: '{ name, description? }', response: 'Project', auth: true },
      { method: 'GET', path: '/api/projects/:id', desc: 'Get project details, members & tasks', body: '—', response: 'Project with members & tasks', auth: true },
      { method: 'PUT', path: '/api/projects/:id', desc: 'Update project name/description (admin)', body: '{ name?, description? }', response: 'Project', auth: true },
      { method: 'DELETE', path: '/api/projects/:id', desc: 'Delete project and all tasks (admin)', body: '—', response: '{ message }', auth: true },
      { method: 'POST', path: '/api/projects/:id/members', desc: 'Add a member by email (admin)', body: '{ email, role? }', response: 'ProjectMember', auth: true },
      { method: 'DELETE', path: '/api/projects/:id/members/:userId', desc: 'Remove a member (admin)', body: '—', response: '{ message }', auth: true },
    ],
  },
  {
    group: 'Tasks',
    color: 'bg-purple-100 text-purple-700',
    routes: [
      { method: 'GET', path: '/api/tasks?projectId=...', desc: 'List tasks (members see only assigned tasks; admins see all)', body: '—', response: 'Task[]', auth: true },
      { method: 'POST', path: '/api/tasks', desc: 'Create a task (admin only)', body: '{ title, description?, dueDate?, priority?, projectId, assignedToId? }', response: 'Task', auth: true },
      { method: 'PUT', path: '/api/tasks/:id', desc: 'Update task (admin: all fields; member: status only)', body: '{ title?, description?, dueDate?, priority?, status?, assignedToId? }', response: 'Task', auth: true },
      { method: 'DELETE', path: '/api/tasks/:id', desc: 'Delete task (admin only)', body: '—', response: '{ message }', auth: true },
    ],
  },
  {
    group: 'Dashboard',
    color: 'bg-orange-100 text-orange-700',
    routes: [
      { method: 'GET', path: '/api/dashboard', desc: 'Get aggregated stats for all user projects', body: '—', response: '{ totalTasks, totalProjects, overdueTasks, byStatus[], byPriority[], tasksByUser[], projects[] }', auth: true },
    ],
  },
  {
    group: 'System',
    color: 'bg-gray-100 text-gray-700',
    routes: [
      { method: 'GET', path: '/api/health', desc: 'Health check endpoint', body: '—', response: '{ status: "ok" }', auth: false },
    ],
  },
];

const METHOD_COLORS = {
  GET: 'bg-blue-500',
  POST: 'bg-green-500',
  PUT: 'bg-yellow-500',
  DELETE: 'bg-red-500',
};

export default function Docs() {
  const [open, setOpen] = useState({});
  const toggle = (key) => setOpen((s) => ({ ...s, [key]: !s[key] }));

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">API Reference</h1>
        <p className="text-gray-500 mt-1">
          TaskFlow REST API — Base URL: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm text-blue-700">/api</code>
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs bg-yellow-50 border border-yellow-200 text-yellow-700 px-2.5 py-1 rounded-full">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Protected routes require <strong className="ml-1">Authorization: Bearer &lt;token&gt;</strong>
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {endpoints.map((group) => (
          <div key={group.group}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${group.color}`}>
                {group.group}
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="space-y-2">
              {group.routes.map((route) => {
                const key = `${route.method}-${route.path}`;
                return (
                  <div key={key} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggle(key)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <span className={`${METHOD_COLORS[route.method]} text-white text-xs font-bold px-2 py-0.5 rounded min-w-[52px] text-center`}>
                        {route.method}
                      </span>
                      <code className="text-sm text-gray-700 font-mono flex-1">{route.path}</code>
                      {route.auth && (
                        <svg className="w-3.5 h-3.5 text-yellow-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      <svg className={`w-4 h-4 text-gray-400 transition-transform ${open[key] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {open[key] && (
                      <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">
                        <p className="text-sm text-gray-600">{route.desc}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Request Body</p>
                            <code className="text-xs bg-white border border-gray-200 text-gray-700 px-2 py-1.5 rounded block">
                              {route.body}
                            </code>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Response</p>
                            <code className="text-xs bg-white border border-gray-200 text-gray-700 px-2 py-1.5 rounded block">
                              {route.response}
                            </code>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Data Models */}
      <div className="mt-10">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Data Models</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              name: 'User',
              fields: ['id: cuid', 'name: string', 'email: string (unique)', 'password: string (hashed)', 'createdAt: datetime'],
            },
            {
              name: 'Project',
              fields: ['id: cuid', 'name: string', 'description?: string', 'createdById: User.id', 'createdAt: datetime'],
            },
            {
              name: 'ProjectMember',
              fields: ['id: cuid', 'projectId: Project.id', 'userId: User.id', 'role: admin | member'],
            },
            {
              name: 'Task',
              fields: ['id: cuid', 'title: string', 'description?: string', 'dueDate?: datetime', 'priority: low | medium | high', 'status: todo | in_progress | done', 'projectId: Project.id', 'assignedToId?: User.id', 'createdById: User.id', 'createdAt: datetime'],
            },
          ].map((model) => (
            <div key={model.name} className="bg-gray-900 rounded-xl p-4">
              <p className="text-blue-400 font-mono text-sm font-semibold mb-2">{model.name}</p>
              <div className="space-y-1">
                {model.fields.map((f) => (
                  <p key={f} className="text-gray-300 font-mono text-xs">{f}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
