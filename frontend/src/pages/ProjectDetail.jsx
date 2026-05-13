import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import AddMemberModal from '../components/AddMemberModal';

const COLUMNS = [
  { key: 'todo', label: 'To Do', color: 'bg-gray-100' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-blue-50' },
  { key: 'done', label: 'Done', color: 'bg-green-50' },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState({ status: 'all', priority: 'all' });

  const fetchProject = useCallback(() => {
    api
      .get(`/projects/${id}`)
      .then((res) => setProject(res.data))
      .catch((err) => {
        if (err.response?.status === 404) navigate('/projects');
        else setError('Failed to load project');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const myRole = project?.members?.find((m) => m.user.id === user?.id)?.role;
  const isAdmin = myRole === 'admin';

  const handleTaskCreated = (task) => {
    setProject((p) => ({ ...p, tasks: [task, ...p.tasks] }));
    setShowCreateTask(false);
  };

  const handleTaskUpdated = (updated) => {
    setProject((p) => ({
      ...p,
      tasks: p.tasks.map((t) => (t.id === updated.id ? updated : t)),
    }));
    setEditingTask(null);
  };

  const handleTaskDeleted = (taskId) => {
    setProject((p) => ({
      ...p,
      tasks: p.tasks.filter((t) => t.id !== taskId),
    }));
  };

  const handleMemberAdded = (member) => {
    setProject((p) => ({ ...p, members: [...p.members, member] }));
    setShowAddMember(false);
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      await api.delete(`/projects/${id}/members/${memberId}`);
      setProject((p) => ({
        ...p,
        members: p.members.filter((m) => m.user.id !== memberId),
      }));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove member');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects');
    } catch {
      alert('Failed to delete project');
    }
  };

  const filteredTasks = (status) =>
    (project?.tasks || []).filter((t) => {
      if (t.status !== status) return false;
      if (filter.priority !== 'all' && t.priority !== filter.priority) return false;
      return true;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return <div className="p-8 text-red-600">{error || 'Project not found'}</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => navigate('/projects')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm text-gray-400">Projects</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="text-gray-500 mt-1 text-sm">{project.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-400">
              {project.tasks.length} tasks • {project.members.length} members
            </span>
            {myRole && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                {myRole}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <select
            value={filter.priority}
            onChange={(e) => setFilter((f) => ({ ...f, priority: e.target.value }))}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {isAdmin && (
            <>
              <button onClick={() => setShowAddMember(true)} className="btn-secondary flex items-center gap-2 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Add Member
              </button>
              <button onClick={() => setShowCreateTask(true)} className="btn-primary flex items-center gap-2 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Task
              </button>
            </>
          )}
        </div>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {COLUMNS.map(({ key, label, color }) => {
          const tasks = filteredTasks(key);
          return (
            <div key={key} className={`rounded-xl ${color} p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700 text-sm">{label}</h3>
                <span className="bg-white text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full border border-gray-200">
                  {tasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isAdmin={isAdmin}
                    currentUserId={user?.id}
                    onEdit={() => setEditingTask(task)}
                    onDelete={() => handleTaskDeleted(task.id)}
                    onStatusChange={(status) =>
                      handleTaskUpdated({ ...task, status })
                    }
                    projectId={id}
                  />
                ))}
                {tasks.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Members section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">Team Members</h3>
          {isAdmin && (
            <button
              onClick={handleDeleteProject}
              className="text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              Delete Project
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {project.members.map((m) => (
            <div key={m.user.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
              <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold uppercase shrink-0">
                {m.user.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{m.user.name}</p>
                <p className="text-xs text-gray-400 truncate">{m.user.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${m.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                  {m.role}
                </span>
                {isAdmin && m.user.id !== user?.id && (
                  <button
                    onClick={() => handleRemoveMember(m.user.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                    title="Remove member"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showCreateTask && (
        <CreateTaskModal
          projectId={id}
          members={project.members}
          onClose={() => setShowCreateTask(false)}
          onCreated={handleTaskCreated}
        />
      )}

      {editingTask && (
        <CreateTaskModal
          projectId={id}
          members={project.members}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onCreated={handleTaskUpdated}
        />
      )}

      {showAddMember && (
        <AddMemberModal
          projectId={id}
          onClose={() => setShowAddMember(false)}
          onAdded={handleMemberAdded}
        />
      )}
    </div>
  );
}
