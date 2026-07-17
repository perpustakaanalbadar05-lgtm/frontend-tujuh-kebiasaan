import { Trophy, CalendarCheck, Award, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  score: number;
}

interface Badge {
  name: string;
  icon: string;
  awarded_at: string;
}

interface StudentDashboardProps {
  data: {
    student_name: string;
    total_score: number;
    journals_this_month: number;
    current_predicate: string;
    filled_today: boolean;
    recent_badges: Badge[];
    chart_data: ChartData[];
  };
}

const StudentDashboard = ({ data }: StudentDashboardProps) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Halo, {data.student_name}! 👋</h2>
          <p className="text-gray-500 text-sm">Berikut adalah ringkasan perkembangan karakter dan prestasimu.</p>
        </div>
      </div>
      
      {/* Alert if not filled today */}
      {!data.filled_today ? (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-orange-800">Jangan Lupa!</h3>
            <p className="text-orange-700 text-sm mt-1">Kamu belum mengisi Jurnal 7 Kebiasaan hari ini. Yuk isi sekarang agar prestasimu terus meningkat!</p>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-start gap-3 shadow-sm">
          <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-green-800">Hebat!</h3>
            <p className="text-green-700 text-sm mt-1">Kamu sudah mengisi jurnal hari ini. Terus pertahankan kebiasaan baikmu!</p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] p-6 rounded-2xl shadow-md text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-20 transform translate-x-4 -translate-y-4">
            <Trophy className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <p className="text-green-50 font-medium mb-1">Total Poin Karakter</p>
            <p className="text-4xl font-extrabold">{data.total_score}</p>
            <p className="text-sm text-green-100 mt-2">Terus kumpulkan poin dari kebiasaan baik!</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-gray-500 font-medium">Jurnal Bulan Ini</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 ml-13 pl-13">{data.journals_this_month} <span className="text-lg font-normal text-gray-500">Hari</span></p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-gray-500 font-medium">Predikat Saat Ini</p>
          </div>
          <p className="text-xl font-bold text-[#2E7D32]">{data.current_predicate}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800">Grafik Poin (7 Hari Terakhir)</h3>
            <p className="text-sm text-gray-500">Pantau konsistensimu setiap hari.</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.chart_data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${value} Poin`, 'Skor Karakter']}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#4CAF50" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Badges */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800">Lencana Terbaru</h3>
            <p className="text-sm text-gray-500">Koleksi prestasimu.</p>
          </div>
          
          <div className="space-y-4">
            {data.recent_badges.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3 opacity-50">🏆</div>
                <p className="text-gray-500 text-sm">Belum ada lencana yang didapat.</p>
              </div>
            ) : (
              data.recent_badges.map((badge, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-2xl border border-gray-100">
                    {badge.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{badge.name}</h4>
                    <p className="text-xs text-gray-500">{badge.awarded_at}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
