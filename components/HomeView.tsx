import React from 'react';
import { User, Task } from '../types';
import { CheckCircle2, Clock, Calendar, TrendingUp } from 'lucide-react';

interface HomeViewProps {
  currentUser: User;
  tasks: Task[];
}

const HomeView: React.FC<HomeViewProps> = ({ currentUser, tasks }) => {
  const myTasks = tasks.filter(t => t.assignee === currentUser.name);
  const completedTasks = myTasks.filter(t => t.status === 'done').length;
  const pendingTasks = myTasks.filter(t => t.status !== 'done').length;
  
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{greeting()}, {currentUser.name}!</h1>
        <p className="text-gray-500">Вот обзор ваших задач на сегодня.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          icon={<CheckCircle2 className="text-green-500" size={24} />}
          label="Выполнено задач"
          value={completedTasks.toString()}
          color="bg-green-50"
        />
        <StatCard 
          icon={<Clock className="text-blue-500" size={24} />}
          label="В ожидании"
          value={pendingTasks.toString()}
          color="bg-blue-50"
        />
        <StatCard 
          icon={<TrendingUp className="text-purple-500" size={24} />}
          label="Продуктивность"
          value="85%"
          color="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-gray-400" />
            Мои задачи на неделю
          </h2>
          <div className="space-y-3">
            {myTasks.slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                 <div className={`w-2 h-2 rounded-full ${task.status === 'done' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                 <span className={`flex-1 text-sm font-medium ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                   {task.title}
                 </span>
                 <span className="text-xs text-gray-400 whitespace-nowrap">
                   {new Date(task.dueDate).toLocaleDateString('ru-RU', {day: 'numeric', month: 'short'})}
                 </span>
              </div>
            ))}
            {myTasks.length === 0 && <div className="text-gray-400 text-sm text-center py-4">Нет задач</div>}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <h2 className="text-xl font-bold mb-4">Совет дня</h2>
          <p className="text-blue-100 leading-relaxed mb-6">
            Использование методики Kanban помогает визуализировать рабочий процесс и ограничивать количество незавершенной работы. Не забывайте перемещать задачи в колонку "Готово"!
          </p>
          <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm">
            Узнать больше
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: any, label: string, value: string, color: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
      {icon}
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 font-medium">{label}</div>
    </div>
  </div>
);

export default HomeView;