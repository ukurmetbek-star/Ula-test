import React from 'react';
import { Task, TaskStatus } from '../types';
import { PRIORITY_COLORS, PRIORITY_LABELS, STATUS_LABELS } from '../constants';
import { Calendar, User, CheckCircle2, MessageSquare } from 'lucide-react';

interface ListViewProps {
  tasks: Task[];
  onAddTask: () => void;
  onTaskClick: (task: Task) => void;
}

const ListView: React.FC<ListViewProps> = ({ tasks, onAddTask, onTaskClick }) => {
  return (
    <div className="w-full h-full overflow-hidden flex flex-col bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-10">
        <div className="col-span-5 pl-2">Задача</div>
        <div className="col-span-2">Исполнитель</div>
        <div className="col-span-2">Срок</div>
        <div className="col-span-1">Приоритет</div>
        <div className="col-span-2">Статус</div>
      </div>
      
      <div className="overflow-y-auto flex-1">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <div className="mb-2">Нет задач</div>
            <button onClick={onAddTask} className="text-blue-600 hover:underline text-sm">Создать первую задачу</button>
          </div>
        ) : (
          tasks.map((task) => (
            <div 
              key={task.id} 
              onClick={() => onTaskClick(task)}
              className="grid grid-cols-12 gap-4 p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center text-sm group cursor-pointer"
            >
              <div className="col-span-5 flex items-center gap-3 pl-2">
                <button className={`text-gray-300 hover:text-green-500 transition-colors ${task.status === TaskStatus.DONE ? 'text-green-500' : ''}`}>
                  <CheckCircle2 size={18} />
                </button>
                <div className="flex flex-col">
                  <span className={`font-medium text-gray-900 ${task.status === TaskStatus.DONE ? 'line-through text-gray-400' : ''}`}>{task.title}</span>
                  {task.comments && task.comments.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                       <MessageSquare size={10} /> {task.comments.length}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="col-span-2 flex items-center gap-2 text-gray-600">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                   {task.assignee ? task.assignee.charAt(0).toUpperCase() : '?'}
                </div>
                <span className="truncate">{task.assignee || 'Не назначен'}</span>
              </div>
              
              <div className="col-span-2 text-gray-500 text-xs flex items-center gap-2">
                {task.dueDate ? (
                   <>
                    <Calendar size={14} className={new Date(task.dueDate) < new Date() ? 'text-red-500' : ''} />
                    <span className={new Date(task.dueDate) < new Date() ? 'text-red-600 font-medium' : ''}>
                      {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                    </span>
                   </>
                ) : (
                  <span className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">--</span>
                )}
              </div>
              
              <div className="col-span-1">
                <span className={`text-[10px] px-2 py-1 rounded font-medium ${PRIORITY_COLORS[task.priority]}`}>
                  {PRIORITY_LABELS[task.priority]}
                </span>
              </div>

               <div className="col-span-2">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded whitespace-nowrap">
                   {STATUS_LABELS[task.status]}
                </span>
              </div>
            </div>
          ))
        )}
        
        <div 
          onClick={onAddTask}
          className="p-3 pl-12 text-gray-400 hover:text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-sm border-b border-gray-100"
        >
          <span className="text-lg">+</span> Добавить задачу...
        </div>
      </div>
    </div>
  );
};

export default ListView;