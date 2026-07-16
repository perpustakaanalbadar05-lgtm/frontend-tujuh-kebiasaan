import { useState, useEffect } from 'react';
import { Medal, Trophy, Star, Loader2 } from 'lucide-react';
import axios from '../../lib/axios';

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
}

interface StudentBadge {
  id: number;
  badge: Badge;
  awarded_at: string;
}

interface AchievementData {
  available_badges: Badge[];
  earned_badges: StudentBadge[];
}

const AchievementPage = () => {
  const [data, setData] = useState<AchievementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/achievements');
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error('Gagal mengambil data pencapaian', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#4CAF50] animate-spin mb-4" />
        <p className="text-gray-500">Memuat koleksi lencana...</p>
      </div>
    );
  }

  const earnedBadgeIds = data?.earned_badges.map(eb => eb.badge.id) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] rounded-3xl p-8 sm:p-12 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="relative z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold mb-4 border border-white/20">
            <Star className="w-4 h-4 text-yellow-300" /> Prestasi Kamu
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2">Koleksi Lencana Hebat</h1>
          <p className="text-green-50 text-lg">Kumpulkan semua lencana dengan terus disiplin mengisi jurnal 7 kebiasaan!</p>
        </div>
        
        <div className="relative z-10 w-32 h-32 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/20 backdrop-blur-md shrink-0">
          <Trophy className="w-16 h-16 text-yellow-300" />
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute right-40 -bottom-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Earned Badges */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-around text-center">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Lencana Diraih</p>
              <p className="text-4xl font-black text-[#2E7D32]">{data?.earned_badges.length || 0}</p>
            </div>
            <div className="w-px h-16 bg-gray-100"></div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Tersedia</p>
              <p className="text-4xl font-black text-gray-600">{data?.available_badges.length || 0}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Medal className="text-yellow-500 w-6 h-6" /> Lencana Yang Sudah Diraih
            </h2>
            
            {data?.earned_badges.length === 0 ? (
              <div className="bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
                <Medal className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-gray-600 font-bold">Belum ada lencana</h3>
                <p className="text-gray-400 text-sm">Ayo mulai mengisi jurnal untuk mendapatkan lencana pertamamu!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data?.earned_badges.map(eb => (
                  <div key={eb.id} className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-2xl p-5 border border-yellow-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-sm border border-yellow-100">
                      {eb.badge.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-yellow-900">{eb.badge.name}</h4>
                      <p className="text-xs text-yellow-700 mt-1 line-clamp-2">{eb.badge.description}</p>
                      <p className="text-[10px] text-yellow-600/70 mt-2 font-medium">Diraih pada: {new Date(eb.awarded_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Available Badges */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Lencana Tersedia</h2>
          
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            {data?.available_badges.filter(b => !earnedBadgeIds.includes(b.id)).length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-8">Luar biasa! Kamu sudah mengumpulkan semua lencana yang tersedia.</p>
            ) : (
              data?.available_badges.filter(b => !earnedBadgeIds.includes(b.id)).map(badge => (
                <div key={badge.id} className="flex gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 opacity-80 grayscale-[30%] hover:grayscale-0 transition-all">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-gray-200 shrink-0">
                    {badge.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-700 text-sm">{badge.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight">{badge.description}</p>
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

export default AchievementPage;
