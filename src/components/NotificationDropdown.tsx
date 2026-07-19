import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import axios from '../lib/axios';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: number;
  title: string;
  message: string;
  url: string | null;
  is_read: boolean;
  created_at: string;
}

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/notifications');
      if (response.data.success) {
        setNotifications(response.data.data.notifications);
        setUnreadCount(response.data.data.unread_count);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const markAsRead = async (id: number, url: string | null) => {
    try {
      await axios.post(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      setIsOpen(false);
      if (url) {
        navigate(url);
      }
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`relative p-2 rounded-full transition-colors ${isOpen || unreadCount > 0 ? 'bg-green-50 text-[#4CAF50]' : 'text-gray-500 hover:bg-gray-100'}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h3 className="font-bold text-gray-800">Notifikasi</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-[#4CAF50] hover:text-[#2E7D32] font-semibold flex items-center gap-1">
                <Check size={14} /> Tandai semua dibaca
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    onClick={() => markAsRead(notification.id, notification.url)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors flex gap-3 ${!notification.is_read ? 'bg-green-50/30' : ''}`}
                  >
                    <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${!notification.is_read ? 'bg-green-500' : 'bg-transparent'}`}></div>
                    <div>
                      <p className={`text-sm ${!notification.is_read ? 'font-bold text-gray-800' : 'font-medium text-gray-700'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
                      <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                        <Clock size={10} /> {formatTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <Bell className="text-gray-300 w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-gray-500">Tidak ada notifikasi baru</p>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-gray-100 text-center bg-gray-50">
            <button onClick={() => { setIsOpen(false); navigate('/dashboard/notifications'); }} className="text-sm text-[#4CAF50] hover:text-[#2E7D32] font-bold">
              Lihat Semua Notifikasi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
