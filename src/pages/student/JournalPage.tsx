import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Save, Loader2, Info } from 'lucide-react';
import axios from '../../lib/axios';

interface Habit {
  id: number;
  name: string;
  order_number: number;
  start_time?: string;
  end_time?: string;
}

interface JournalForm {
  habit_id: number;
  is_done: boolean;
  time_performed?: string;
  note: string;
  is_locked_item?: boolean;
}

const JournalPage = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<JournalForm[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  // Fungsi untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD (zona waktu lokal)
  const getLocalDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fungsi untuk memuat data habits dan jurnal hari ini dari server
  const loadJournalData = async () => {
    try {
      const response = await axios.get('/master/habits');
      if (response.data.success) {
        const fetchedHabits = response.data.data;
        setHabits(fetchedHabits);
        
        const dateString = getLocalDateString();

        // Fetch jurnal hari ini jika ada
        const todayRes = await axios.get(`/journals/today?date=${dateString}`);
        const todayJournal = todayRes.data?.data?.journal;
        setIsLocked(todayRes.data?.data?.is_locked || false);

        console.log('[JournalPage] Date:', dateString);
        console.log('[JournalPage] API /journals/today response:', JSON.stringify(todayRes.data?.data));

        // Inisialisasi state form berdasarkan data dari server
        const initialForm = fetchedHabits.map((h: Habit) => {
          // Number() diperlukan karena MySQL production mengembalikan habit_id sebagai string
          const detail = todayJournal?.details?.find((d: any) => Number(d.habit_id) === Number(h.id));
          const isDone = detail ? Boolean(detail.is_done) : false;
          
          console.log(`[JournalPage] Habit ${h.id} (${h.name}): detail found=${!!detail}, is_done=${isDone}`);
          
          return {
            habit_id: h.id,
            is_done: isDone,
            time_performed: detail?.time_performed?.substring(0, 5) || '',
            note: detail?.note || '',
            is_locked_item: isDone // Mengunci item yang sudah dicentang dan tersimpan agar tidak bisa diubah lagi
          };
        });
        setFormState(initialForm);
      }
    } catch (error) {
      console.error('Gagal mengambil data habit', error);
      setErrorMsg('Gagal memuat daftar kebiasaan dari server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJournalData();
  }, []);

  const isTimeOutOfRange = (timePerformed: string, start?: string, end?: string) => {
    if (!start || !end) return false;
    const t = timePerformed.substring(0, 5);
    const s = start.substring(0, 5);
    const e = end.substring(0, 5);
    return t < s || t > e;
  };

  const handleToggle = (habitId: number) => {
    const habit = habits.find(h => h.id === habitId);
    
    setFormState(prev => prev.map(item => {
      if (item.habit_id === habitId) {
        const willBeDone = !item.is_done;
        let timePerformed = item.time_performed;
        
        // Jika dicentang, otomatis ambil jam perangkat saat ini
        if (willBeDone) {
          const now = new Date();
          const hours = String(now.getHours()).padStart(2, '0');
          const minutes = String(now.getMinutes()).padStart(2, '0');
          timePerformed = `${hours}:${minutes}`;

          // Validasi ketat: Cegah toggle jika di luar jam
          if (habit && isTimeOutOfRange(timePerformed, habit.start_time, habit.end_time)) {
            setErrorMsg(`Maaf, batas waktu untuk "${habit.name}" adalah ${habit.start_time?.substring(0,5)} - ${habit.end_time?.substring(0,5)}. Saat ini jam ${timePerformed}.`);
            return item; // Batalkan perubahan
          }
        } else {
          timePerformed = '';
        }
        
        setErrorMsg(''); // Bersihkan pesan error jika berhasil
        return { ...item, is_done: willBeDone, time_performed: timePerformed };
      }
      return item;
    }));
  };

  const handleNoteChange = (habitId: number, note: string) => {
    setFormState(prev => prev.map(item => 
      item.habit_id === habitId ? { ...item, note } : item
    ));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const dateString = getLocalDateString();

      // Bersihkan payload: kirim hanya field yang dibutuhkan backend
      const cleanHabits = formState.map(item => ({
        habit_id: item.habit_id,
        is_done: item.is_done,
        time_performed: item.is_done && item.time_performed ? item.time_performed : null,
        note: item.note || null,
      }));

      const payload = {
        date: dateString,
        habits: cleanHabits
      };

      console.log('[JournalPage] Submitting payload:', JSON.stringify(payload));

      const response = await axios.post('/journals', payload);
      if (response.data.success) {
        setSuccessMsg('Jurnal hari ini berhasil dikirim!');
        
        // Reload data dari server agar formState diperbarui dengan data terbaru
        // sehingga centang yang sudah disimpan tetap muncul dan terkunci
        await loadJournalData();
      }
    } catch (error: any) {
      console.error('[JournalPage] Submit error:', error.response?.data || error);
      if (error.response?.data?.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg('Terjadi kesalahan saat menyimpan jurnal.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTodayDate = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('id-ID', options);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#4CAF50] animate-spin mb-4" />
        <p className="text-gray-500">Memuat jurnal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Jurnal 7 Kebiasaan</h2>
          <div className="flex items-center gap-2 text-green-100 bg-black/10 w-fit px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
            <Calendar size={16} />
            <span>{getTodayDate()}</span>
          </div>
        </div>
        {/* Dekorasi Glassmorphism */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute right-20 -bottom-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
          <CheckCircle className="w-12 h-12 text-green-500" />
          <p className="text-lg font-bold">Luar Biasa!</p>
          <p className="text-sm">{successMsg}</p>
        </div>
      )}

      {isLocked && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium">Jurnal pagi Anda telah divalidasi. Anda masih dapat mengisi sisa kegiatan untuk hari ini, namun kegiatan yang sudah disetujui tidak dapat dibatalkan.</p>
        </div>
      )}

      {/* Form List */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            {habits.map((habit, index) => {
              const state = formState.find(s => s.habit_id === habit.id);
              const isDone = state?.is_done || false;
              const isLockedItem = state?.is_locked_item || false;
              
              return (
                <div key={habit.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-gray-800 mb-1">
                        {index + 1}. {habit.name}
                      </h4>
                      
                      {/* Optional Note Input (Visible when turned ON) */}
                      <div className={`mt-3 transition-all duration-300 overflow-hidden ${isDone ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="w-full sm:w-1/3">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Jam Tercatat (Otomatis)</label>
                            <input
                              type="time"
                              required={isDone}
                              readOnly
                              disabled={isLockedItem}
                              value={state?.time_performed || ''}
                              className="w-full text-sm px-3 py-2 bg-gray-100 border border-gray-200 text-gray-600 rounded-lg focus:outline-none cursor-not-allowed transition-colors"
                            />
                          </div>
                          <div className="w-full sm:w-2/3">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Catatan (Opsional)</label>
                            <input
                              type="text"
                              placeholder="Misal: Tepat waktu..."
                              disabled={isLockedItem}
                              value={state?.note || ''}
                              onChange={(e) => handleNoteChange(habit.id, e.target.value)}
                              className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] transition-colors disabled:opacity-50"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      disabled={isLockedItem}
                      onClick={() => handleToggle(habit.id)}
                      className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${isDone ? 'bg-[#4CAF50]' : 'bg-gray-200'}`}
                    >
                      <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isDone ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-transform transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-md hover:shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Mengirim...
                </>
              ) : (
                <>
                  <Save size={20} /> Simpan Jurnal Hari Ini
                </>
              )}
            </button>
          </div>
        </form>
    </div>
  );
};

export default JournalPage;
