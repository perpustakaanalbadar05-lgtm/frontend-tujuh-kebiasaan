import { useState, useEffect } from 'react';
import { BarChart3, Loader2, ArrowUpRight, ArrowDownRight, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from '../../lib/axios';

interface ClassData {
  class_id: number;
  class_name: string;
  total_students: number;
  total_journals_filled: number;
  average_score: number;
}

const ClassComparisonPage = () => {
  const [data, setData] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/monitoring/class-comparison');
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error('Gagal mengambil data perbandingan kelas', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#4CAF50] animate-spin mb-4" />
        <p className="text-gray-500">Memuat analitik perbandingan kelas...</p>
      </div>
    );
  }

  // Find Top Performing Class based on Average Score
  const topClass = data.length > 0 ? [...data].sort((a, b) => b.average_score - a.average_score)[0] : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="text-[#4CAF50] w-7 h-7" /> Perbandingan Kelas
          </h1>
          <p className="text-gray-500 text-sm mt-1">Analisis dan komparasi performa antar rombongan belajar.</p>
        </div>
      </div>

      {topClass && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-6 sm:p-8 flex items-center justify-between shadow-sm">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold mb-3 uppercase tracking-wider">
              🏆 Kelas Terbaik
            </div>
            <h2 className="text-3xl font-black text-gray-800 mb-1">{topClass.class_name}</h2>
            <p className="text-gray-500 text-sm flex items-center gap-2">
              <Users size={16} /> {topClass.total_students} Siswa Aktif
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-400 mb-1">Rata-rata Skor</p>
            <p className="text-4xl font-black text-[#4CAF50]">{topClass.average_score}%</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart: Average Score */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Rata-rata Skor per Kelas</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="class_name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="average_score" name="Skor Rata-rata (%)" fill="#4CAF50" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart: Journal Submissions */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Total Jurnal Disubmit per Kelas</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="class_name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="total_journals_filled" name="Total Jurnal" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Detail Rekapitulasi Kelas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-sm font-semibold text-gray-500">
                <th className="p-4 border-b border-gray-100">Nama Kelas</th>
                <th className="p-4 border-b border-gray-100 text-center">Jumlah Siswa</th>
                <th className="p-4 border-b border-gray-100 text-center">Total Jurnal</th>
                <th className="p-4 border-b border-gray-100 text-center">Rata-rata Skor</th>
                <th className="p-4 border-b border-gray-100 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((cls) => {
                const isGood = cls.average_score >= 70;
                return (
                  <tr key={cls.class_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-800">{cls.class_name}</td>
                    <td className="p-4 text-center text-gray-600">{cls.total_students}</td>
                    <td className="p-4 text-center font-medium text-gray-700">{cls.total_journals_filled}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-bold ${isGood ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {cls.average_score}%
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {isGood ? (
                        <div className="flex items-center justify-center gap-1 text-green-600 text-xs font-bold">
                          <ArrowUpRight size={16} /> Optimal
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1 text-red-500 text-xs font-bold">
                          <ArrowDownRight size={16} /> Perlu Perhatian
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Belum ada data kelas yang aktif.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassComparisonPage;
