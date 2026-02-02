import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { COLUMNS, PRIORITY_COLORS, PRIORITY_LABELS } from '../constants';
import { MoreHorizontal, Plus, Calendar, User, MessageSquare } from 'lucide-react';

interface BoardViewProps {
  tasks: Task[];
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask: (status?: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
}

const BoardView: React.FC<BoardViewProps> = ({ tasks, onMoveTask, onAddTask, onTaskClick }) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTaskId) {
      onMoveTask(draggedTaskId, status);
      setDraggedTaskId(null);
    }
  };

  return (
    <div className="flex h-full overflow-x-auto pb-4 gap-6 min-w-full">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);

        return (
          <div
            key={column.id}
            className="flex-shrink-0 w-80 flex flex-col h-full rounded-xl bg-gray-50/50"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex items-center justify-between p-3 mb-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-700 text-sm">{column.title}</h3>
                <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
              <div className="flex gap-1">
                 <button onClick={() => onAddTask(column.id)} className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto px-2 pb-2 transition-colors ${draggedTaskId ? 'bg-blue-50/30' : ''}`}>
              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => onTaskClick(task)}
                    className="group bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-all active:cursor-grabbing"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase tracking-wide ${PRIORITY_COLORS[task.priority]}`}>
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3 leading-snug">{task.title}</h4>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center text-xs text-gray-500 gap-1">
                           <User size={14} className="text-gray-400" />
                           <span className="truncate max-w-[80px]">{task.assignee || '—'}</span>
                        </div>
                         {task.dueDate && (
                          <div className={`flex items-center text-xs gap-1 ${new Date(task.dueDate) < new Date() ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                            <Calendar size={14} />
                            <span>{new Date(task.dueDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {task.comments && task.comments.length > 0 && (
                          <div className="flex items-center text-xs text-gray-400 gap-0.5">
                            <MessageSquare size={12} />
                            <span>{task.comments.length}</span>
                          </div>
                        )}
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold border-2 border-white shadow-sm">
                           {task.assignee ? task.assignee.charAt(0).toUpperCase() : '?'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => onAddTask(column.id)}
                className="w-full mt-3 py-2 border border-dashed border-gray-300 rounded-lg text-gray-400 text-sm hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Добавить задачу
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BoardView;