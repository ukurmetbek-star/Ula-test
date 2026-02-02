import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import BoardView from './components/BoardView';
import ListView from './components/ListView';
import HomeView from './components/HomeView';
import InboxView from './components/InboxView';
import ReportsView from './components/ReportsView';
import TaskModal from './components/TaskModal';
import NewProjectModal from './components/NewProjectModal';
import TaskDetailModal from './components/TaskDetailModal';
import AuthView from './components/AuthView';
import ProfileModal from './components/ProfileModal';
import { Task, TaskStatus, ViewMode, TaskPriority, AppView, User, Project, Comment, Notification, UserRole, ReportRequest, ReportSubmission, ReportStatus, UserGroup } from './types';
import { LayoutGrid, List as ListIcon, Search, Bell, Filter, Plus, Menu, Lock } from 'lucide-react';

const INITIAL_USERS: User[] = [
  { id: '1', name: 'Иван Иванов', role: 'admin', avatarColor: 'bg-indigo-500', password: '123' },
  { id: '2', name: 'Елена Петрова', role: 'manager', avatarColor: 'bg-pink-500', password: '123' },
  { id: '3', name: 'Алексей Смирнов', role: 'employee', avatarColor: 'bg-blue-500', password: '123' },
];

const INITIAL_PROJECTS: Project[] = [
  { id: 'p1', name: 'Редизайн сайта', color: 'bg-blue-500' },
  { id: 'p2', name: 'Мобильное приложение', color: 'bg-purple-500' },
  { id: 'p3', name: 'Маркетинг Q4', color: 'bg-green-500' },
];

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    projectId: 'p1',
    title: 'Разработать дизайн главной страницы',
    description: 'Нужно обновить UX/UI в соответствии с новым брендбуком.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    dueDate: '2023-11-15',
    assignee: 'Алексей Смирнов',
    comments: [],
    isPersonal: false,
  },
  {
    id: '2',
    projectId: 'p1',
    title: 'Интеграция API платежей',
    description: 'Подключить Stripe и PayPal.',
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    dueDate: '2023-11-20',
    assignee: 'Иван Иванов',
    comments: [
      { id: 'c1', text: 'Stripe API ключи уже в секретах?', authorName: 'Елена Петрова', authorRole: 'manager', createdAt: new Date().toISOString(), avatarColor: 'bg-pink-500' }
    ],
    isPersonal: false,
  },
  {
    id: '3',
    projectId: 'p2',
    title: 'Написать документацию',
    description: 'Обновить README и Wiki проекта.',
    status: TaskStatus.DONE,
    priority: TaskPriority.LOW,
    dueDate: '2023-11-01',
    assignee: 'Елена Петрова',
    comments: [],
    isPersonal: false,
  },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'Добро пожаловать', description: 'Добро пожаловать в Asana for Eduser!', time: 'Только что', read: false, type: 'alert', toUserId: '1' },
];

export default function App() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]); // New Group State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  
  // Reports State
  const [reportRequests, setReportRequests] = useState<ReportRequest[]>([]);
  const [reportSubmissions, setReportSubmissions] = useState<ReportSubmission[]>([]);

  const [currentView, setCurrentView] = useState<AppView>('home');
  const [currentProjectId, setCurrentProjectId] = useState<string>('p1');
  
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [initialStatusForModal, setInitialStatusForModal] = useState<TaskStatus | undefined>(undefined);
  
  // Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');

  // Auth Logic
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('home');
  };

  const handleRegister = (name: string, role: UserRole, password: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      role,
      password,
      avatarColor: ['bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500'][Math.floor(Math.random() * 5)]
    };
    setUsers([...users, newUser]);
    
    setNotifications(prev => [
      { id: `n-${Date.now()}`, title: 'Добро пожаловать', description: 'Спасибо за регистрацию!', time: 'Только что', read: false, type: 'alert', toUserId: newUser.id },
      ...prev
    ]);
    
    setCurrentUser(newUser);
    setCurrentView('home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleUpdateUser = (updatedData: Partial<User>) => {
    if (currentUser) {
       const updatedUser = { ...currentUser, ...updatedData };
       setCurrentUser(updatedUser);
       setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    }
  };

  // Group Logic
  const handleCreateGroup = (name: string, userIds: string[]) => {
    const newGroup: UserGroup = {
      id: `g-${Date.now()}`,
      name,
      userIds
    };
    setUserGroups([...userGroups, newGroup]);
  };

  const handleDeleteGroup = (groupId: string) => {
    setUserGroups(userGroups.filter(g => g.id !== groupId));
  };

  // Report Logic
  const handleCreateRequest = (req: ReportRequest) => {
    setReportRequests([...reportRequests, req]);
    // Notify assigned users
    req.assignedUserIds.forEach(uid => {
      setNotifications(prev => [
        { 
          id: `n-${Date.now()}-${uid}`, 
          title: 'Запрос отчета', 
          description: `Требуется сдать отчет: ${req.title}`, 
          time: 'Только что', 
          read: false, 
          type: 'alert', 
          toUserId: uid 
        },
        ...prev
      ]);
    });
  };

  const handleSubmitReport = (sub: ReportSubmission) => {
    // If resubmitting, replace old submission
    const existingIndex = reportSubmissions.findIndex(s => s.requestId === sub.requestId && s.userId === sub.userId);
    if (existingIndex >= 0) {
      const updated = [...reportSubmissions];
      updated[existingIndex] = sub;
      setReportSubmissions(updated);
    } else {
      setReportSubmissions([...reportSubmissions, sub]);
    }
    
    // Notify admin who created the request (simplified: notify the first admin found)
    const admin = users.find(u => u.role === 'admin');
    if (admin) {
        setNotifications(prev => [
        { 
          id: `n-${Date.now()}-adm`, 
          title: 'Отчет сдан', 
          description: `${currentUser?.name} сдал отчет.`, 
          time: 'Только что', 
          read: false, 
          type: 'assignment', 
          toUserId: admin.id 
        },
        ...prev
      ]);
    }
  };

  const handleUpdateSubmissionStatus = (submissionId: string, status: ReportStatus, feedback?: string) => {
    const updated = reportSubmissions.map(s => 
      s.id === submissionId ? { ...s, status, feedback } : s
    );
    setReportSubmissions(updated);
  };

  // Notification Logic
  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleSendNotification = (toUserId: string, title: string, message: string) => {
    const newNote: Notification = {
      id: `n-${Date.now()}`,
      title,
      description: message,
      time: 'Только что',
      read: false,
      type: 'message',
      toUserId,
      fromUserName: currentUser?.name
    };
    setNotifications([newNote, ...notifications]);
  };

  // Task Logic
  const handleAddTask = (taskData: Partial<Task>) => {
    const isPersonal = currentView === 'personal';
    const projectId = currentView === 'project' ? currentProjectId : undefined;

    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      projectId: projectId,
      title: taskData.title!,
      description: taskData.description || '',
      status: taskData.status || TaskStatus.TODO,
      priority: taskData.priority || TaskPriority.MEDIUM,
      dueDate: taskData.dueDate || '',
      assignee: isPersonal ? currentUser!.name : (taskData.assignee || 'Не назначен'),
      comments: [],
      isPersonal: isPersonal
    };
    setTasks([...tasks, newTask]);

    if (!isPersonal && newTask.assignee !== 'Не назначен' && newTask.assignee !== currentUser?.name) {
      const assigneeUser = users.find(u => u.name === newTask.assignee);
      if (assigneeUser) {
        const notif: Notification = {
          id: `n-${Date.now()}`,
          title: 'Новая задача',
          description: `Вам назначена задача: ${newTask.title}`,
          time: 'Только что',
          read: false,
          type: 'assignment',
          toUserId: assigneeUser.id
        };
        setNotifications([notif, ...notifications]);
      }
    }
  };

  const handleCreateProject = (name: string, color: string) => {
    const newProject: Project = {
      id: `p${Date.now()}`,
      name,
      color,
    };
    setProjects([...projects, newProject]);
    setCurrentView('project');
    setCurrentProjectId(newProject.id);
  };

  const handleAddComment = (taskId: string, text: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      text,
      authorName: currentUser!.name,
      authorRole: currentUser!.role,
      avatarColor: currentUser!.avatarColor,
      createdAt: new Date().toISOString(),
    };
    
    setTasks(prevTasks => prevTasks.map(t => {
      if (t.id === taskId) {
        return { ...t, comments: [...t.comments, newComment] };
      }
      return t;
    }));
    
    if (selectedTask && selectedTask.id === taskId) {
       setSelectedTask(prev => prev ? { ...prev, comments: [...prev.comments, newComment] } : null);
    }
  };

  const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const openAddTaskModal = (status?: TaskStatus) => {
    setInitialStatusForModal(status);
    setIsModalOpen(true);
  };

  const handleNavigate = (view: AppView, projectId?: string) => {
    setCurrentView(view);
    if (projectId) {
      setCurrentProjectId(projectId);
    }
  };

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    if (!currentUser) return [];
    let result = tasks;

    if (currentView === 'personal') {
      result = result.filter(t => t.isPersonal && t.assignee === currentUser.name);
    } else {
      result = result.filter(t => !t.isPersonal);
      if (currentView === 'my_tasks') {
        result = result.filter(t => t.assignee === currentUser.name);
      } else if (currentView === 'project') {
        result = result.filter(t => t.projectId === currentProjectId);
      }
    }

    if (filterPriority !== 'all') {
      result = result.filter(t => t.priority === filterPriority);
    }
    return result;
  }, [tasks, currentView, currentProjectId, currentUser, filterPriority]);

  const activeProject = projects.find(p => p.id === currentProjectId) || projects[0];
  const unreadNotificationsCount = notifications.filter(n => n.toUserId === currentUser?.id && !n.read).length;

  if (!currentUser) {
    return <AuthView users={users} onLogin={handleLogin} onRegister={handleRegister} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <HomeView currentUser={currentUser} tasks={tasks.filter(t => !t.isPersonal)} />;
      case 'inbox':
        return (
          <InboxView 
            notifications={notifications} 
            currentUser={currentUser} 
            users={users}
            onMarkAsRead={handleMarkAsRead}
            onSendNotification={handleSendNotification}
          />
        );
      case 'reports':
        return (
          <ReportsView 
            tasks={tasks.filter(t => !t.isPersonal)} 
            projects={projects} 
            currentUser={currentUser}
            users={users}
            reportRequests={reportRequests}
            reportSubmissions={reportSubmissions}
            userGroups={userGroups}
            onCreateRequest={handleCreateRequest}
            onSubmitReport={handleSubmitReport}
            onUpdateSubmissionStatus={handleUpdateSubmissionStatus}
            onCreateGroup={handleCreateGroup}
            onDeleteGroup={handleDeleteGroup}
          />
        );
      case 'my_tasks':
      case 'project':
      case 'personal':
        return (
          <>
            {/* Toolbar */}
            <div className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 border-b border-gray-100 bg-white z-10">
              <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('board')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'board'
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <LayoutGrid size={16} />
                  Доска
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ListIcon size={16} />
                  Список
                </button>
              </div>

              <div className="flex items-center gap-3 relative">
                 <button 
                   onClick={() => setIsFilterOpen(!isFilterOpen)}
                   className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${filterPriority !== 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                 >
                   <Filter size={16} />
                   {filterPriority !== 'all' ? 'Фильтр активен' : 'Фильтр'}
                 </button>
                 
                 {isFilterOpen && (
                   <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-2">
                     <div className="text-xs font-semibold text-gray-400 uppercase px-2 py-1">Приоритет</div>
                     <button onClick={() => { setFilterPriority('all'); setIsFilterOpen(false); }} className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-50 ${filterPriority === 'all' ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>Все</button>
                     <button onClick={() => { setFilterPriority(TaskPriority.HIGH); setIsFilterOpen(false); }} className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-50 ${filterPriority === TaskPriority.HIGH ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>Высокий</button>
                     <button onClick={() => { setFilterPriority(TaskPriority.MEDIUM); setIsFilterOpen(false); }} className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-50 ${filterPriority === TaskPriority.MEDIUM ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>Средний</button>
                     <button onClick={() => { setFilterPriority(TaskPriority.LOW); setIsFilterOpen(false); }} className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-50 ${filterPriority === TaskPriority.LOW ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>Низкий</button>
                   </div>
                 )}

                 <button 
                   onClick={() => openAddTaskModal()}
                   className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm shadow-blue-200 transition-all active:scale-95"
                 >
                   <Plus size={18} />
                   Добавить
                 </button>
              </div>
            </div>

            {/* Tasks Area */}
            <div className="flex-1 overflow-hidden px-6 py-6 bg-white relative">
               <div className="mb-4">
                 <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                   {currentView === 'my_tasks' && 'Мои задачи'}
                   {currentView === 'personal' && <><Lock size={20} className="text-gray-400" /> Личные задачи</>}
                   {currentView === 'project' && activeProject.name}
                 </h2>
                 <p className="text-sm text-gray-500">
                    {currentView === 'personal' ? 'Видны только вам' : `${filteredTasks.length} задач`}
                 </p>
               </div>

              {viewMode === 'board' ? (
                <BoardView 
                  tasks={filteredTasks} 
                  onMoveTask={handleMoveTask} 
                  onAddTask={openAddTaskModal}
                  onTaskClick={setSelectedTask}
                />
              ) : (
                <ListView 
                  tasks={filteredTasks} 
                  onAddTask={() => openAddTaskModal()}
                  onTaskClick={setSelectedTask}
                />
              )}
            </div>
          </>
        );
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      <Sidebar 
        currentView={currentView}
        currentProjectId={currentProjectId}
        onNavigate={handleNavigate}
        projects={projects}
        onCreateProject={() => setIsProjectModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />
      
      <main className="flex-1 flex flex-col min-w-0 bg-white h-screen">
        {/* Header */}
        <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0 z-20">
          <div className="flex items-center gap-4">
             <button className="md:hidden text-gray-500">
               <Menu />
             </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-0.5">
                <span className="uppercase font-semibold tracking-wider">
                  {currentUser.role === 'admin' ? 'Администратор' : currentUser.role === 'manager' ? 'Менеджер' : 'Сотрудник'}
                </span>
                <span>/</span>
                <span>{currentUser.name}</span>
              </div>
              <h1 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                 {currentView === 'personal' ? 'Личное пространство' : 'Командное пространство'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-1.5 w-64 transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:bg-white">
                <Search size={16} className="text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Поиск..." 
                  className="bg-transparent border-none focus:outline-none text-sm w-full text-gray-700 placeholder-gray-400" 
                />
             </div>
             
             <button 
               onClick={() => setCurrentView('inbox')}
               className="relative text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
             >
               <Bell size={20} />
               {unreadNotificationsCount > 0 && (
                 <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
               )}
             </button>
             
             <button onClick={() => setIsProfileModalOpen(true)} className={`w-8 h-8 rounded-full ${currentUser.avatarColor} text-white flex items-center justify-center font-semibold text-sm shadow-md ring-2 ring-white hover:opacity-80 transition-opacity`}>
               {currentUser.name.charAt(0)}
             </button>
          </div>
        </header>

        {/* Content Render */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {renderContent()}
        </div>
      </main>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddTask}
        initialStatus={initialStatusForModal}
      />

      <NewProjectModal 
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleCreateProject}
      />

      <TaskDetailModal 
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        currentUser={currentUser}
        onAddComment={handleAddComment}
      />

      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser}
        onUpdateUser={handleUpdateUser}
      />
    </div>
  );
}