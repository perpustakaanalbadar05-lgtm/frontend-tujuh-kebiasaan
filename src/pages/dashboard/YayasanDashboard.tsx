
import { Building2, Users, GraduationCap, Trophy, MapPin, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface YayasanDashboardProps {
  data: {
    total_schools: number;
    total_students: number;
    total_teachers: number;
    leaderboard: { name: string; journals: number }[];
    chart_data?: { name: string; partisipasi: number }[];
  };
}

const YayasanDashboard = ({ data }: YayasanDashboardProps) => {
  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Eksekutif Yayasan</h1>
          <p className="text-gray-500 mt-1">Pemantauan performa multi-sekolah dalam satu layar.</p>
        </div>
        <div className="bg-[#4CAF50]/10 text-[#2E7D32] px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          <span>Yayasan Pendidikan Al-Fatih</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Sekolah Aktif</p>
            <h3 className="text-3xl font-bold text-gray-800">{data.total_schools}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="p-4 bg-green-50 text-green-600 rounded-xl">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Siswa Yayasan</p>
            <h3 className="text-3xl font-bold text-gray-800">{data.total_students}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="p-4 bg-orange-50 text-orange-600 rounded-xl">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Guru Yayasan</p>
            <h3 className="text-3xl font-bold text-gray-800">{data.total_teachers}</h3>
          </div>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Klasemen Sekolah (Minggu Ini)</h2>
            <p className="text-sm text-gray-500">Peringkat berdasarkan volume pengisian jurnal harian</p>
          </div>
        </div>

        <div className="space-y-4">
          {data.leaderboard.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Activity className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Belum ada data aktivitas jurnal minggu ini.</p>
            </div>
          ) : (
            data.leaderboard.map((school, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-green-50 rounded-xl border border-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                    ${index === 0 ? 'bg-yellow-100 text-yellow-600 border border-yellow-200' : 
                      index === 1 ? 'bg-gray-200 text-gray-600 border border-gray-300' : 
                      index === 2 ? 'bg-orange-100 text-orange-600 border border-orange-200' : 
                      'bg-white text-gray-400 border border-gray-200'}`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {school.name}
                    </h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-white border border-gray-200 rounded-lg font-bold text-[#4CAF50]">
                    {school.journals} <span className="text-xs text-gray-400 font-normal">Jurnal</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* National Chart Section */}
      {data.chart_data && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800">Tren Jurnal Nasional (7 Hari Terakhir)</h3>
            <p className="text-sm text-gray-500">Total partisipasi pengisian jurnal dari seluruh sekolah di bawah naungan Yayasan.</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.chart_data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPartisipasiNasional" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${value} Jurnal`, 'Total Nasional']}
                />
                <Area 
                  type="monotone" 
                  dataKey="partisipasi" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPartisipasiNasional)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default YayasanDashboard;
