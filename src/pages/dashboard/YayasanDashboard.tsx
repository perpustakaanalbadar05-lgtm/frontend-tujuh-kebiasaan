
import { Building2, Users, GraduationCap, Trophy, MapPin, Activity } from 'lucide-react';

interface YayasanDashboardProps {
  data: {
    total_schools: number;
    total_students: number;
    total_teachers: number;
    leaderboard: { name: string; journals: number }[];
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
    </div>
  );
};

export default YayasanDashboard;
