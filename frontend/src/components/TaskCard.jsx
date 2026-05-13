import { useState } from 'react';
import api from '../api/axios';

const PRIORITY_DOT = {
  low: 'bg-gray-400',
  medium: 'bg-yellow-400',
  high: 'bg-red-500',
};

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

function isOverdue(dueDate) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

export default function TaskCard({ task, isAdmin, currentUserId, onEdit, onDelete, onStatusChange, projectId }) {
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const canUpdate = isAdmin || task.assignedToId === currentUserId;

  const handleStatusChange = async (newStatus) => {
    if (!canUpdate) return;
    setUpdatingStatus(true);
    try {
      const { data } = await api.put(`/tasks/${task.id}`, { status: newStatus });
      onStatusChange(data.status);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    setDeleting(true);
    try {
      await api.delete(`/tasks/${task.id}`);
      onDelete();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete task');
      setDeleting(false);
    }
  };

  const overdue = isOverdue(task.dueDate) && task.status !== 'done';

  return (
    <div className={`bg-white rounded-lg border ${overdue ? 'border-red-200' : 'border-gray-200'} p-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-semibold text-gray-800 leading-snug flex-1">
          {task.title}
        </h4>
        <div className="flex items-center gap-1 shrink-0">
          <span className={`w-2 h-2 rounded-full ${PRIORITY_DOT[task.priority] || 'bg-gray-400'}`} title={task.priority} />
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`badge-${task.priority} text-xs`}>
          {task.priority}
        </span>
        {overdue && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            Overdue
          </span>
        )}
      </div>

      {task.dueDate && (
        <p className={`text-xs mb-3 ${overdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
          Due {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}

      {task.assignedTo && (
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
            {task.assignedTo.name[0]}
          </div>
          <span className="text-xs text-gray-500 truncate">{task.assignedTo.name}</span>
        </div>
      )}

      {/* Status selector */}
      {canUpdate && (
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={updatingStatus}
          className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}

      {/* Actions */}
      {isAdmin && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={onEdit}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium"
          >
            Edit
          </button>
          <span className="text-gray-200">|</span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-red-500 hover:text-red-700 transition-colors font-medium disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  );
}
