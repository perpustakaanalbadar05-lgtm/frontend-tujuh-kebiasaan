import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Circle, Loader2, Calendar } from 'lucide-react';
import axios from '../../lib/axios';
import { Link } from 'react-router-dom';

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  url: string | null;
  created_at: string;
}

const NotificationInboxPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/notifications');
      if (response.data.success) {
        setNotifications(response.data.data.notifications);
      }
    } catch (error) {
      console.error('Gagal mengambil notifikasi', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await axios.post(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Gagal menandai notifikasi', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Gagal menandai semua notifikasi', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#4CAF50] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Memuat notifikasi...</p>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notification Center</h1>
          <p className="text-gray-500 mt-1">
            Anda memiliki {unreadCount} notifikasi yang belum dibaca.
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-sm font-medium text-[#4CAF50] hover:text-[#388E3C] bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Tandai Semua Sudah Dibaca
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-700">Tidak ada notifikasi</h3>
            <p className="text-gray-500 mt-1 text-sm">Kotak masuk Anda kosong untuk saat ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-5 transition-colors flex items-start gap-4 ${!notification.is_read ? 'bg-[#4CAF50]/5 hover:bg-[#4CAF50]/10' : 'hover:bg-gray-50'}`}
                onClick={() => { if(!notification.is_read) markAsRead(notification.id) }}
              >
                <div className="mt-1">
                  {!notification.is_read ? (
                    <Circle className="w-3 h-3 text-[#4CAF50] fill-current" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`text-base font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                    {notification.title}
                  </h4>
                  <p className="text-gray-600 text-sm mt-1 mb-2 leading-relaxed">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(notification.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                    {notification.url && (
                      <Link 
                        to={notification.url} 
                        className="text-[#4CAF50] hover:underline font-medium"
                      >
                        Lihat Detail &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationInboxPage;
