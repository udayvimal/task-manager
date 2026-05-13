import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  todo: 'bg-gray-200',
  in_progress: 'bg-blue-400',
  done: 'bg-green-400',
};

const PRIORITY_COLORS = {
  low: 'bg-gray-200',
  medium: 'bg-yellow-400',
  high: 'bg-red-400',
};

function StatCard({ label, value, icon, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function BarChart({ data, colorMap, label }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-700 mb-4">{label}</h3>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.key}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 capitalize">{item.key.replace('_', ' ')}</span>
              <span className="font-medium text-gray-800">{item.count}</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${colorMap[item.key] || 'bg-blue-400'}`}
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No data yet</p>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard')
      .then((res) => setStats(res.data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">{error}</div>
    );
  }

  const statusData = (stats.byStatus || []).map((s) => ({ key: s.status, count: s.count }));
  const priorityData = (stats.byPriority || []).map((p) => ({ key: p.priority, count: p.count }));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening across your projects.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          label="Total Tasks"
          value={stats.totalTasks}
          color="bg-blue-100"
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          label="Projects"
          value={stats.totalProjects}
          color="bg-purple-100"
          icon={
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          }
        />
        <StatCard
          label="Completed"
          value={stats.byStatus?.find((s) => s.status === 'done')?.count || 0}
          color="bg-green-100"
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Overdue"
          value={stats.overdueTasks}
          color={stats.overdueTasks > 0 ? 'bg-red-100' : 'bg-gray-100'}
          icon={
            <svg className={`w-6 h-6 ${stats.overdueTasks > 0 ? 'text-red-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <BarChart
          data={statusData}
          label="Tasks by Status"
          colorMap={STATUS_COLORS}
        />
        <BarChart
          data={priorityData}
          label="Tasks by Priority"
          colorMap={PRIORITY_COLORS}
        />

        {/* Tasks per user */}
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-4">Tasks per Member</h3>
          <div className="space-y-3">
            {(stats.tasksByUser || []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No assignments yet</p>
            ) : (
              stats.tasksByUser.map((u) => (
                <div key={u.userId} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
                    {u.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{u.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{u.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent projects */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">Your Projects</h3>
          <Link to="/projects" className="text-sm text-blue-600 hover:underline">
            View all →
          </Link>
        </div>
        {stats.projects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-3">No projects yet</p>
            <Link to="/projects" className="btn-primary text-sm">
              Create your first project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.projects.map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg shrink-0" />
                <span className="text-sm font-medium text-gray-700 truncate">{p.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
