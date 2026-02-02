import React, { useState, useRef, useEffect } from 'react';
import { Task, User, TaskStatus, TaskPriority, Comment } from '../types';
import { X, Send, User as UserIcon, Calendar, CheckCircle2, MessageSquare, Trash2 } from 'lucide-react';
import { STATUS_LABELS, PRIORITY_LABELS, PRIORITY_COLORS } from '../constants';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  currentUser: User;
  onAddComment: (taskId: string, text: string) => void;
  onDeleteTask?: (taskId: string) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, onClose, task, currentUser, onAddComment, onDeleteTask }) => {
  const [commentText, setCommentText] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, task?.comments]);

  if (!isOpen || !task) return null;

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(task.id, commentText);
      setCommentText('');
    }
  };

  const canComment = ['admin', 'manager', 'employee'].includes(currentUser.role); // Everyone can comment in this design, but roles are visible

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 md:border-r border-gray-200 overflow-y-auto">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
               <button 
                className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-semibold uppercase tracking-wide border ${task.status === TaskStatus.DONE ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
               >
                 {task.status === TaskStatus.DONE && <CheckCircle2 size={14} />}
                 {STATUS_LABELS[task.status]}
               </button>
            </div>
            <div className="flex items-center gap-2">
               {onDeleteTask && (
                 <button onClick={() => onDeleteTask(task.id)} className="text-gray-400 hover:text-red-500 p-2 transition-colors" title="Удалить задачу">
                   <Trash2 size={18} />
                 </button>
               )}
               <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 transition-colors">
                 <X size={20} />
               </button>
            </div>
          </div>

          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">{task.title}</h1>
            
            <div className="flex flex-wrap gap-6 mb-8 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-xs font-semibold uppercase">Исполнитель</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                    {task.assignee.charAt(0)}
                  </div>
                  <span className="text-gray-900 font-medium">{task.assignee}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-xs font-semibold uppercase">Срок</span>
                <div className="flex items-center gap-2 text-gray-900">
                  <Calendar size={16} className="text-gray-400" />
                  <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('ru-RU') : 'Нет срока'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-gray-500 text-xs font-semibold uppercase">Приоритет</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold inline-block ${PRIORITY_COLORS[task.priority]}`}>
                  {PRIORITY_LABELS[task.priority]}
                </span>
              </div>
            </div>

            <div className="prose prose-sm max-w-none text-gray-700">
              <h3 className="text-gray-900 font-semibold mb-2">Описание</h3>
              <div className="whitespace-pre-wrap leading-relaxed">
                {task.description || <span className="text-gray-400 italic">Описание отсутствует</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Comments */}
        <div className="w-full md:w-80 bg-gray-50 flex flex-col h-1/2 md:h-full shrink-0">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <MessageSquare size={16} className="text-gray-500" />
            <span className="font-semibold text-gray-700 text-sm">Комментарии</span>
            <span className="bg-gray-200 text-gray-600 text-xs font-bold px-1.5 rounded-full">{task.comments?.length || 0}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {task.comments?.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-8">Нет комментариев</div>
            ) : (
              task.comments?.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full ${comment.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {comment.authorName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900 truncate">{comment.authorName}</span>
                      <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="bg-white p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm text-sm text-gray-700 border border-gray-100">
                      {comment.text}
                    </div>
                    {comment.authorRole !== 'employee' && (
                       <span className="text-[10px] text-blue-500 font-medium ml-1">{comment.authorRole === 'admin' ? 'Админ' : 'Менеджер'}</span>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={commentsEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 bg-white">
            {canComment ? (
              <form onSubmit={handleSendComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Написать комментарий..."
                  className="flex-1 bg-gray-100 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none"
                />
                <button 
                  type="submit"
                  disabled={!commentText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white p-2 rounded-lg transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
            ) : (
              <div className="text-xs text-center text-gray-400">Комментирование отключено</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TaskDetailModal;