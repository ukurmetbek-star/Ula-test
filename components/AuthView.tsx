import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface AuthViewProps {
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (name: string, role: UserRole, password: string) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ users, onLogin, onRegister }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login State
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || '');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register State
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('employee');
  const [regPassword, setRegPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    const user = users.find(u => u.id === selectedUserId);
    if (user) {
      if (user.password === loginPassword) {
        onLogin(user);
      } else {
        setLoginError('Неверный пароль');
      }
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regName.trim() && regPassword.trim()) {
      onRegister(regName, regRole, regPassword);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-blue-600 px-8 py-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-1">Asana for Eduser</h1>
          <p className="text-blue-100 text-sm">Управление проектами для образования</p>
        </div>

        <div className="p-8">
          <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => { setMode('login'); setLoginError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'login' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Вход
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'register' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Регистрация
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Пользователь</label>
                <select 
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role === 'admin' ? 'Админ' : user.role === 'manager' ? 'Менеджер' : 'Сотрудник'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${loginError ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Введите пароль"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {loginError && <p className="text-red-500 text-xs mt-1">{loginError}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Войти в систему
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Имя и Фамилия</label>
                <input 
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Иван Петров"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Роль в системе</label>
                <div className="grid grid-cols-3 gap-2">
                  <RoleOption 
                    role="employee" 
                    label="Сотрудник" 
                    selected={regRole === 'employee'} 
                    onClick={() => setRegRole('employee')} 
                  />
                  <RoleOption 
                    role="manager" 
                    label="Менеджер" 
                    selected={regRole === 'manager'} 
                    onClick={() => setRegRole('manager')} 
                  />
                  <RoleOption 
                    role="admin" 
                    label="Админ" 
                    selected={regRole === 'admin'} 
                    onClick={() => setRegRole('admin')} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Придумайте пароль</label>
                <input 
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors mt-2"
              >
                Зарегистрироваться
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const RoleOption = ({ role, label, selected, onClick }: { role: UserRole, label: string, selected: boolean, onClick: () => void }) => (
  <div 
    onClick={onClick}
    className={`cursor-pointer border-2 rounded-lg p-2 text-center transition-all ${selected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
  >
    <div className="text-xs font-bold">{label}</div>
  </div>
);

export default AuthView;