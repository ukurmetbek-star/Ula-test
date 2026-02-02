import React, { useState } from 'react';
import { Bell, MessageSquare, UserPlus, Send, X, AlertCircle } from 'lucide-react';
import { Notification, User } from '../types';

interface InboxViewProps {
  notifications: Notification[];
  currentUser: User;
  users: User[];
  onMarkAsRead: (id: string) => void;
  onSendNotification: (toUserId: string, title: string, message: string) => void;
}

const InboxView: React.FC<InboxViewProps> = ({ notifications, currentUser, users, onMarkAsRead, onSendNotification }) => {
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [recipientId, setRecipientId] = useState(users[0]?.id || '');
  const [msgTitle, setMsgTitle] = useState('');
  const [msgBody, setMsgBody] = useState('');

  const canSend = currentUser.role === 'admin';

  const myNotifications = notifications.filter(n => n.toUserId === currentUser.id);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (recipientId && msgTitle && msgBody) {
      onSendNotification(recipientId, msgTitle, msgBody);
      setIsComposeOpen(false);
      setMsgTitle('');
      setMsgBody('');
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
        <h1 className="text-xl font-bold text-gray-900">Входящие</h1>
        {canSend && (
          <button 
            onClick={() => setIsComposeOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send size={16} />
            Отправить уведомление
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {myNotifications.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Bell size={48} className="mx-auto mb-4 opacity-20" />
              <p>У вас пока нет новых уведомлений</p>
            </div>
          ) : (
            myNotifications.map(notification => (
              <NotificationItem 
                key={notification.id}
                notification={notification}
                onRead={() => onMarkAsRead(notification.id)}
              />
            ))
          )}
          
          {myNotifications.length > 0 && myNotifications.every(n => n.read) && (
            <div className="text-center py-10 text-gray-400">
              <p>Вы прочитали все уведомления 🎉</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">Новое сообщение</h3>
              <button onClick={() => setIsComposeOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSend} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Получатель</label>
                <select 
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                >
                  {users.filter(u => u.id !== currentUser.id).map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Тема</label>
                <input 
                  type="text"
                  required
                  value={msgTitle}
                  onChange={(e) => setMsgTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Важное объявление"
                />
              </div>
              <div>
                 <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Сообщение</label>
                 <textarea
                   required
                   value={msgBody}
                   onChange={(e) => setMsgBody(e.target.value)}
                   className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 min-h-[100px]"
                   placeholder="Текст сообщения..."
                 />
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
                  Отправить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const NotificationItem = ({ notification, onRead }: { notification: Notification, onRead: () => void }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'assignment': return <UserPlus size={18} className="text-blue-600" />;
      case 'comment': return <MessageSquare size={18} className="text-green-600" />;
      case 'alert': return <AlertCircle size={18} className="text-red-600" />;
      case 'message': return <Bell size={18} className="text-purple-600" />;
      default: return <Bell size={18} className="text-gray-600" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'assignment': return 'bg-blue-100';
      case 'comment': return 'bg-green-100';
      case 'alert': return 'bg-red-100';
      case 'message': return 'bg-purple-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div 
      onClick={!notification.read ? onRead : undefined}
      className={`flex gap-4 p-4 rounded-xl border ${!notification.read ? 'bg-white border-blue-200 shadow-sm cursor-pointer hover:shadow-md' : 'bg-gray-50 border-transparent opacity-70'} transition-all`}
    >
      <div className={`w-10 h-10 rounded-full ${getBgColor()} flex items-center justify-center shrink-0`}>
        {getIcon()}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
            {notification.title}
          </h4>
          <span className="text-xs text-gray-400">{notification.time}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
        {notification.fromUserName && (
          <p className="text-xs text-gray-400 mt-2">От: {notification.fromUserName}</p>
        )}
      </div>
      {!notification.read && <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" title="Не прочитано"></div>}
    </div>
  );
};

export default InboxView;