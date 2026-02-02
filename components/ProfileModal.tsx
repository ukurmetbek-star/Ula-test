import React, { useState } from 'react';
import { User } from '../types';
import { X, Save, Lock, User as UserIcon } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateUser: (updatedData: Partial<User>) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onUpdateUser }) => {
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState(user.password || '');
  const [email, setEmail] = useState(user.email || '');
  const [position, setPosition] = useState(user.position || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name,
      password,
      email,
      position
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Профиль пользователя</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
           <div className="flex justify-center mb-4">
             <div className={`w-20 h-20 rounded-full ${user.avatarColor} flex items-center justify-center text-white text-3xl font-bold shadow-md`}>
               {user.name.charAt(0)}
             </div>
           </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Имя</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
             <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Должность / Email</label>
             <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none mb-2"
              />
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Ваша должность"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
              />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Пароль</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
             <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              <Save size={16} />
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;