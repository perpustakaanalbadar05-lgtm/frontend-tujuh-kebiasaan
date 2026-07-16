
import { Users, GraduationCap, CheckSquare, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { name: 'Senin', partisipasi: 4000 },
  { name: 'Selasa', partisipasi: 3000 },
  { name: 'Rabu', partisipasi: 2000 },
  { name: 'Kamis', partisipasi: 2780 },
  { name: 'Jumat', partisipasi: 1890 },
  { name: 'Sabtu', partisipasi: 2390 },
  { name: 'Minggu', partisipasi: 3490 },
];

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-gray-500 text-sm">Ringkasan aktivitas dan performa sekolah Anda.</p>
        </div>
      </div>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Siswa</p>
            <p className="text-2xl font-bold text-gray-900">1,245</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Guru</p>
            <p className="text-2xl font-bold text-gray-900">84</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
            <CheckSquare className="w-6 h-6 text-[#4CAF50]" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Jurnal Terisi (Mg ini)</p>
            <p className="text-2xl font-bold text-gray-900">8,532</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tingkat Aktivitas</p>
            <p className="text-2xl font-bold text-gray-900">92%</p>
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800">Tren Pengisian Jurnal (7 Hari Terakhir)</h3>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={mockChartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPartisipasi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="partisipasi" 
                stroke="#4CAF50" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorPartisipasi)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
