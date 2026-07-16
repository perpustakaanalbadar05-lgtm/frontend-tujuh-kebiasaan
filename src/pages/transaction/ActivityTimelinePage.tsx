import { useState, useEffect } from 'react';
import { Activity, Clock, Database, UserCircle, Loader2 } from 'lucide-react';
import axios from '../../lib/axios';

interface ActivityLog {
  id: number;
  user_name: string;
  user_role: string;
  action: string;
  description: string;
  created_at: string;
}

interface AuditLog {
  id: number;
  user_name: string;
  user_role: string;
  table_name: string;
  action: string;
  old_values: string;
  new_values: string;
  created_at: string;
}

const ActivityTimelinePage = () => {
  const [activeTab, setActiveTab] = useState<'activity' | 'audit'>('activity');
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [activeTab]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'activity') {
        const res = await axios.get('/activity-logs');
        setActivities(res.data.data.data || []);
      } else {
        const res = await axios.get('/audit-logs');
        setAudits(res.data.data.data || []);
      }
    } catch (error) {
      console.error('Gagal mengambil data log', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Riwayat Sistem</h1>
          <p className="text-gray-500 text-sm mt-1">CCTV Sistem - Pantau aktivitas pengguna dan perubahan data.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2 ${activeTab === 'activity' ? 'bg-white text-[#4CAF50] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Activity className="w-4 h-4" /> Log Aktivitas
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2 ${activeTab === 'audit' ? 'bg-white text-[#4CAF50] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Database className="w-4 h-4" /> Log Audit
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[#4CAF50]" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          
          {/* Timeline UI */}
          <div className="relative border-l-2 border-gray-100 ml-3 sm:ml-6 space-y-8 pb-4">
            
            {activeTab === 'activity' && activities.length === 0 && (
              <p className="text-gray-400 pl-6">Belum ada aktivitas yang tercatat.</p>
            )}

            {activeTab === 'audit' && audits.length === 0 && (
              <p className="text-gray-400 pl-6">Belum ada perubahan data master yang tercatat.</p>
            )}

            {activeTab === 'activity' && activities.map((log) => (
              <div key={log.id} className="relative pl-8 sm:pl-10">
                {/* Timeline Dot */}
                <span className="absolute -left-2.5 top-1 w-5 h-5 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                </span>
                
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <UserCircle className="w-5 h-5 text-gray-400" />
                      <span className="font-bold text-gray-800">{log.user_name || 'System'}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-gray-200 text-gray-600">
                        {log.user_role || 'Auto'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                  <div className="mb-1">
                    <span className="inline-block px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-xs font-semibold mr-2 border border-blue-100">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{log.description}</p>
                </div>
              </div>
            ))}

            {activeTab === 'audit' && audits.map((log) => (
              <div key={log.id} className="relative pl-8 sm:pl-10">
                <span className={`absolute -left-2.5 top-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${log.action === 'insert' ? 'bg-green-100' : log.action === 'delete' ? 'bg-red-100' : 'bg-orange-100'}`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${log.action === 'insert' ? 'bg-green-500' : log.action === 'delete' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                </span>
                
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <UserCircle className="w-5 h-5 text-gray-400" />
                      <span className="font-bold text-gray-800">{log.user_name || 'System'}</span>
                    </div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                  <div className="mb-3">
                    <span className={`inline-block px-2.5 py-1 rounded text-xs font-semibold mr-2 border uppercase ${log.action === 'insert' ? 'bg-green-50 text-green-700 border-green-100' : log.action === 'delete' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                      {log.action}
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                      Tabel: <code className="bg-gray-200 px-1.5 py-0.5 rounded text-pink-600">{log.table_name}</code>
                    </span>
                  </div>
                  
                  {log.action === 'update' && (
                    <div className="grid grid-cols-2 gap-4 mt-2 bg-white p-3 rounded-lg border border-gray-200 overflow-x-auto text-xs">
                      <div>
                        <p className="font-bold text-gray-500 mb-1">Nilai Lama (Old):</p>
                        <pre className="text-red-600 whitespace-pre-wrap">{log.old_values}</pre>
                      </div>
                      <div>
                        <p className="font-bold text-gray-500 mb-1">Nilai Baru (New):</p>
                        <pre className="text-green-600 whitespace-pre-wrap">{log.new_values}</pre>
                      </div>
                    </div>
                  )}

                  {log.action === 'insert' && (
                    <div className="mt-2 bg-white p-3 rounded-lg border border-gray-200 overflow-x-auto text-xs">
                      <p className="font-bold text-gray-500 mb-1">Data Baru:</p>
                      <pre className="text-green-600 whitespace-pre-wrap">{log.new_values}</pre>
                    </div>
                  )}

                  {log.action === 'delete' && (
                    <div className="mt-2 bg-white p-3 rounded-lg border border-gray-200 overflow-x-auto text-xs">
                      <p className="font-bold text-gray-500 mb-1">Data Dihapus:</p>
                      <pre className="text-red-600 whitespace-pre-wrap">{log.old_values}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))}

          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityTimelinePage;
