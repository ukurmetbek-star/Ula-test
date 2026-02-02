import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { STATUS_LABELS, PRIORITY_LABELS } from '../constants';
import { X, Sparkles, Loader2, Calendar } from 'lucide-react';
import { generateTaskDescription } from '../services/geminiService';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  initialStatus?: TaskStatus;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, initialStatus }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(initialStatus || TaskStatus.TODO);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen && initialStatus) {
      setStatus(initialStatus);
    }
    if (!isOpen) {
      // Reset form on close
      setTitle('');
      setDescription('');
      setStatus(TaskStatus.TODO);
      setPriority(TaskPriority.MEDIUM);
      setAssignee('');
      setDueDate('');
      setIsGenerating(false);
    }
  }, [isOpen, initialStatus]);

  if (!isOpen) return null;

  const handleGenerateDescription = async () => {
    if (!title) return;
    setIsGenerating(true);
    const desc = await generateTaskDescription(title);
    setDescription(desc);
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      status,
      priority,
      assignee: assignee || 'Я',
      dueDate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Новая задача</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Название задачи</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Что нужно сделать?"
              className="w-full px-4 py-2 text-lg font-medium text-gray-900 placeholder-gray-300 border-b-2 border-gray-100 focus:border-blue-500 focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          <div>
             <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase">Описание</label>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={!title || isGenerating}
                  className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-all ${
                    !title 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-purple-600 bg-purple-50 hover:bg-purple-100'
                  }`}
                >
                  {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  {isGenerating ? 'Думаю...' : 'AI Помощник'}
                </button>
             </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Добавьте детали..."
              className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 focus:outline-none min-h-[100px] resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Статус</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              >
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Приоритет</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              >
                {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Исполнитель</label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Имя сотрудника"
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Срок исполнения</label>
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <Calendar className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-200 transition-all transform active:scale-95"
            >
              Создать задачу
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
