import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Eye, X, Loader2, Calendar } from 'lucide-react';
import axios from '../../lib/axios';
import { useAuth } from '../../contexts/AuthContext';

interface Journal {
  id: number;
  date: string;
  score: number;
  status: string;
  student: {
    name: string;
    nis: string;
  };
  details: {
    id: number;
    habit_id: number;
    is_done: boolean;
    note: string | null;
    time_performed?: string | null;
    habit?: { name: string; start_time?: string; end_time?: string };
  }[];
  teacher_approval: {
    status: string;
  } | null;
  parent_approval: {
    status: string;
  } | null;
}

const JournalApprovalPage = () => {
  const { user } = useAuth();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  
  const [isApproving, setIsApproving] = useState(false);
  const [actionNote, setActionNote] = useState('');
  const [overriddenDetails, setOverriddenDetails] = useState<any[]>([]);

  const handleOpenModal = (journal: Journal) => {
    setSelectedJournal(journal);
    setOverriddenDetails(JSON.parse(JSON.stringify(journal.details))); // Deep copy
    setActionNote('');
  };

  const handleToggleDetail = (detailId: number) => {
    if (user?.role !== 'orangtua') return;
    setOverriddenDetails(prev => 
      prev.map(d => d.id === detailId ? { ...d, is_done: !d.is_done } : d)
    );
  };

  const fetchJournals = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/journals');
      if (response.data.success) {
        setJournals(response.data.data.data); // Asumsi pagination .data.data
      }
    } catch (error) {
      console.error('Gagal mengambil data jurnal', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (!selectedJournal) return;
    setIsApproving(true);
    
    // Tentukan endpoint berdasarkan role
    const endpointRole = user?.role === 'orangtua' ? 'parent' : 'teacher';
    
    try {
      const payload = {
        status,
        ...(endpointRole === 'parent' ? { 
          note: actionNote,
          overrides: overriddenDetails.map(d => ({ id: d.id, is_done: d.is_done }))
        } : {})
      };
      
      const response = await axios.post(`/journals/${selectedJournal.id}/approve-${endpointRole}`, payload);
      
      if (response.data.success) {
        // Refresh tabel & tutup modal
        fetchJournals();
        setSelectedJournal(null);
        setActionNote('');
      }
    } catch (error) {
      console.error('Gagal memvalidasi', error);
      alert('Gagal memvalidasi jurnal ini.');
    } finally {
      setIsApproving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const isTimeOutOfRange = (timePerformed?: string | null, start?: string, end?: string) => {
    if (!timePerformed || !start || !end) return false;
    const t = timePerformed.substring(0, 5);
    const s = start.substring(0, 5);
    const e = end.substring(0, 5);
    return t < s || t > e;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Validasi Jurnal</h1>
          <p className="text-gray-500 text-sm mt-1">Pantau dan setujui jurnal harian siswa.</p>
        </div>
        <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm w-full sm:w-auto focus-within:ring-2 focus-within:ring-[#4CAF50]/20 focus-within:border-[#4CAF50] transition-all">
          <Search className="text-gray-400 w-5 h-5 mr-2" />
          <input 
            type="text" 
            placeholder="Cari siswa atau tanggal..." 
            className="outline-none text-sm w-full bg-transparent"
          />
        </div>
      </div>

      {/* Tabel Data */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-sm font-semibold text-gray-600">
                <th className="p-4">Siswa</th>
                <th className="p-4">Tanggal Jurnal</th>
                <th className="p-4 text-center">Skor</th>
                <th className="p-4 text-center">Validasi Anda</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <Loader2 className="w-8 h-8 text-[#4CAF50] animate-spin mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Memuat data...</p>
                  </td>
                </tr>
              ) : journals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Belum ada jurnal yang disubmit.
                  </td>
                </tr>
              ) : (
                journals.map((journal) => {
                  const myApproval = user?.role === 'orangtua' 
                    ? journal.parent_approval 
                    : journal.teacher_approval;

                  return (
                    <tr key={journal.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-semibold text-gray-800">{journal.student?.name}</p>
                        <p className="text-xs text-gray-500">NIS: {journal.student?.nis}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} />
                          {formatDate(journal.date)}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${journal.score >= 70 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {journal.score}%
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {!myApproval ? (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">Menunggu</span>
                        ) : myApproval.status === 'approved' ? (
                          <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-1 rounded-md font-medium inline-flex items-center gap-1"><CheckCircle size={12}/> Disetujui</span>
                        ) : (
                          <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded-md font-medium inline-flex items-center gap-1"><XCircle size={12}/> Ditolak</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleOpenModal(journal)}
                          className="p-2 text-gray-400 hover:text-[#4CAF50] hover:bg-green-50 rounded-lg transition-colors"
                          title="Lihat Detail & Validasi"
                        >
                          <Eye size={20} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail */}
      {selectedJournal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Detail Jurnal</h3>
                <p className="text-sm text-gray-500">{selectedJournal.student.name} • {formatDate(selectedJournal.date)}</p>
              </div>
              <button 
                onClick={() => setSelectedJournal(null)}
                className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              <div className="bg-[#4CAF50]/5 rounded-xl p-4 border border-[#4CAF50]/10 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Total Skor Hari Ini</span>
                <span className="text-xl font-black text-[#2E7D32]">{selectedJournal.score}%</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rincian Kebiasaan</h4>
                  {user?.role === 'orangtua' && (
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-semibold border border-blue-100">
                      Klik ikon centang untuk mengubah
                    </span>
                  )}
                </div>
                {overriddenDetails?.map((detail) => (
                  <div key={detail.id} className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-xl">
                    <button 
                      type="button"
                      onClick={() => handleToggleDetail(detail.id)}
                      disabled={user?.role !== 'orangtua'}
                      className={`mt-0.5 focus:outline-none transition-transform ${user?.role === 'orangtua' ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
                    >
                      {detail.is_done ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${detail.is_done ? 'text-gray-800' : 'text-gray-500'}`}>
                          {detail.habit?.name || `Kebiasaan #${detail.habit_id}`}
                        </p>
                        {detail.is_done && detail.time_performed && (
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
                            {detail.time_performed.substring(0, 5)}
                          </span>
                        )}
                      </div>
                      
                      {detail.is_done && detail.time_performed && isTimeOutOfRange(detail.time_performed, detail.habit?.start_time, detail.habit?.end_time) && (
                        <p className="text-[11px] text-red-600 flex items-center gap-1 mt-1 font-semibold">
                          ⚠️ Di luar jam valid ({detail.habit?.start_time?.substring(0,5)} - {detail.habit?.end_time?.substring(0,5)})
                        </p>
                      )}

                      {detail.note && (
                        <p className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded-md italic">"{detail.note}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {user?.role === 'orangtua' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-gray-700 mb-2">Catatan/Pesan Tambahan (Opsional)</label>
                  <textarea 
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#4CAF50]/20 focus:border-[#4CAF50] outline-none transition-all resize-none h-20"
                    placeholder="Tulis pesan penyemangat untuk anak..."
                  ></textarea>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => handleAction('rejected')}
                disabled={isApproving}
                className="px-6 py-2.5 rounded-xl font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                Tolak
              </button>
              <button 
                onClick={() => handleAction('approved')}
                disabled={isApproving}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#4CAF50] hover:bg-[#388E3C] shadow-md transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isApproving && <Loader2 className="w-4 h-4 animate-spin" />}
                Setujui Jurnal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default JournalApprovalPage;
