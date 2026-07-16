import { useState, useEffect } from 'react';
import { BarChart3, Loader2, TrendingUp, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from '../../lib/axios';

const COLORS = ['#4CAF50', '#FF9800', '#2196F3', '#F44336', '#9E9E9E'];

const MonitoringPage = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`/monitoring/${period}`);
        if (res.data.success) setData(res.data.data);
      } catch { /* empty */ } finally { setIsLoading(false); }
    };
    fetchData();
  }, [period]);

  if (isLoading) return <div className="flex flex-col items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 text-[#4CAF50] animate-spin mb-4" /><p className="text-gray-500">Menganalisis data...</p></div>;

  const dailyData = period === 'daily' ? data : null;
  const weeklyData = period === 'weekly' ? data : null;
  const monthlyData = period === 'monthly' ? data : null;

  const statusPie = dailyData ? [
    { name: 'Disetujui', value: dailyData.status_breakdown?.approved || 0 },
    { name: 'Menunggu Ortu', value: dailyData.status_breakdown?.pending_parent || 0 },
    { name: 'Menunggu Guru', value: dailyData.status_breakdown?.pending_teacher || 0 },
    { name: 'Revisi', value: dailyData.status_breakdown?.revision || 0 },
    { name: 'Draft', value: dailyData.status_breakdown?.draft || 0 },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-gray-800">Monitoring</h2><p className="text-sm text-gray-500">Pantau perkembangan pengisian jurnal dan approval.</p></div>
        <div className="flex bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
          {(['daily', 'weekly', 'monthly'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p ? 'bg-[#4CAF50] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
              {p === 'daily' ? 'Harian' : p === 'weekly' ? 'Mingguan' : 'Bulanan'}
            </button>
          ))}
        </div>
      </div>

      {/* Daily View */}
      {dailyData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center"><Users className="w-6 h-6 text-blue-600" /></div><div><p className="text-sm text-gray-500">Total Siswa</p><p className="text-2xl font-bold text-gray-900">{dailyData.total_students}</p></div></div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-[#E8F5E9] flex items-center justify-center"><CheckCircle className="w-6 h-6 text-[#4CAF50]" /></div><div><p className="text-sm text-gray-500">Sudah Mengisi</p><p className="text-2xl font-bold text-gray-900">{dailyData.filled}</p></div></div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center"><AlertCircle className="w-6 h-6 text-red-500" /></div><div><p className="text-sm text-gray-500">Belum Mengisi</p><p className="text-2xl font-bold text-gray-900">{dailyData.not_filled}</p></div></div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-purple-600" /></div><div><p className="text-sm text-gray-500">Tingkat Pengisian</p><p className="text-2xl font-bold text-gray-900">{dailyData.fill_rate}%</p></div></div>
          </div>
          {statusPie.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Status Jurnal Hari Ini</h3>
              <div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusPie} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}>
                {statusPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie><Tooltip /></PieChart></ResponsiveContainer></div>
            </div>
          )}
        </>
      )}

      {/* Weekly View */}
      {weeklyData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Tren Pengisian Jurnal (7 Hari Terakhir)</h3>
          <div className="h-[350px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={weeklyData.daily_data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey="total" fill="#4CAF50" radius={[6, 6, 0, 0]} name="Total Jurnal" />
            <Bar dataKey="approved" fill="#2196F3" radius={[6, 6, 0, 0]} name="Disetujui" />
          </BarChart></ResponsiveContainer></div>
        </div>
      )}

      {/* Monthly View */}
      {monthlyData && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Tren Bulanan</h3>
            <div className="h-[350px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthlyData.daily_data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="total" fill="#4CAF50" radius={[4, 4, 0, 0]} name="Total" />
              <Bar dataKey="approved" fill="#2196F3" radius={[4, 4, 0, 0]} name="Disetujui" />
            </BarChart></ResponsiveContainer></div>
          </div>
          {monthlyData.class_data?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100"><h3 className="text-lg font-bold text-gray-800">Rekap Per Kelas</h3></div>
              <table className="w-full"><thead><tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Kelas</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Total Jurnal</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Disetujui</th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tingkat Approval</th>
              </tr></thead><tbody className="divide-y divide-gray-50">
                {monthlyData.class_data.map((c: any) => (
                  <tr key={c.class_id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-semibold text-gray-800">{c.class_name}</td>
                    <td className="px-6 py-4 text-center text-sm">{c.total}</td>
                    <td className="px-6 py-4 text-center text-sm">{c.approved}</td>
                    <td className="px-6 py-4 text-center"><span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">{c.total > 0 ? Math.round((c.approved / c.total) * 100) : 0}%</span></td>
                  </tr>
                ))}
              </tbody></table>
            </div>
          )}
        </>
      )}

      {!data && <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center"><BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-1">Belum Ada Data</h3><p className="text-gray-500 text-sm">Data monitoring akan muncul setelah ada jurnal yang diisi.</p></div>}
    </div>
  );
};

export default MonitoringPage;
