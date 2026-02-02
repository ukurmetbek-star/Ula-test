import React, { useState } from 'react';
import { Home, CheckSquare, Inbox, BarChart2, Plus, Users, Settings, ChevronDown, LogOut, Lock } from 'lucide-react';
import { AppView, Project, User } from '../types';

interface SidebarProps {
  currentView: AppView;
  currentProjectId?: string;
  onNavigate: (view: AppView, projectId?: string) => void;
  projects: Project[];
  onCreateProject: () => void;
  currentUser: User;
  onLogout: () => void;
  onOpenProfile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  currentProjectId, 
  onNavigate, 
  projects, 
  onCreateProject,
  currentUser,
  onLogout,
  onOpenProfile
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Helper to determine permissions
  const canViewReports = ['admin', 'manager', 'employee'].includes(currentUser.role); // Everyone sees reports now, but view differs

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-screen flex flex-col hidden md:flex">
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
        <span className="text-xl font-bold text-gray-800 tracking-tight">Asana for Eduser</span>
      </div>

      <div className="px-4 mb-6">
        <button 
          onClick={onCreateProject}
          className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-full flex items-center justify-center gap-2 shadow-sm transition-all text-sm font-medium active:scale-95"
        >
          <Plus size={16} />
          <span>Новый проект</span>
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Главное</div>
        <NavItem 
          icon={<Home size={18} />} 
          label="Главная" 
          active={currentView === 'home'} 
          onClick={() => onNavigate('home')}
        />
        <NavItem 
          icon={<CheckSquare size={18} />} 
          label="Мои задачи" 
          active={currentView === 'my_tasks'} 
          onClick={() => onNavigate('my_tasks')}
        />
        <NavItem 
          icon={<Lock size={18} />} 
          label="Личные задачи" 
          active={currentView === 'personal'} 
          onClick={() => onNavigate('personal')}
        />
        <NavItem 
          icon={<Inbox size={18} />} 
          label="Входящие" 
          active={currentView === 'inbox'} 
          onClick={() => onNavigate('inbox')}
        />
        
        {canViewReports && (
          <NavItem 
            icon={<BarChart2 size={18} />} 
            label="Отчеты" 
            active={currentView === 'reports'} 
            onClick={() => onNavigate('reports')}
          />
        )}
        
        <div className="mt-8 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Проекты</div>
        {projects.map(project => (
           <NavItem 
             key={project.id}
             icon={<div className={`w-2 h-2 rounded-full ${project.color}`} />} 
             label={project.name} 
             active={currentView === 'project' && currentProjectId === project.id}
             onClick={() => onNavigate('project', project.id)}
           />
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 relative">
        <div 
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
        >
           <div className={`w-8 h-8 rounded-full ${currentUser.avatarColor} flex items-center justify-center text-white font-bold text-xs`}>
             {currentUser.name.charAt(0)}
           </div>
           <div className="flex flex-col flex-1 min-w-0">
             <span className="text-sm font-medium text-gray-700 truncate">{currentUser.name}</span>
             <span className="text-xs text-gray-500 capitalize truncate">
               {currentUser.role === 'admin' ? 'Администратор' : currentUser.role === 'manager' ? 'Менеджер' : 'Сотрудник'}
             </span>
           </div>
           <ChevronDown size={14} className="text-gray-400" />
        </div>

        {isUserMenuOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
            <button
               onClick={() => {
                 onOpenProfile();
                 setIsUserMenuOpen(false);
               }}
               className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-blue-50 text-gray-700 transition-colors"
            >
              <Settings size={16} /> Профиль
            </button>
            <button
              onClick={() => {
                onLogout();
                setIsUserMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-sm flex items-center gap-2 hover:bg-red-50 text-red-600 transition-colors border-t border-gray-50"
            >
              <LogOut size={16} />
              Выйти
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span className={active ? 'text-blue-600' : 'text-gray-500'}>{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
};

export default Sidebar;