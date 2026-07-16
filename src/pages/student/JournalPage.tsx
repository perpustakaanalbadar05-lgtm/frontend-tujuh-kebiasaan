import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Save, Loader2, Info } from 'lucide-react';
import axios from '../../lib/axios';

interface Habit {
  id: number;
  name: string;
  order_number: number;
}

interface JournalForm {
  habit_id: number;
  is_done: boolean;
  note: string;
}

const JournalPage = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<JournalForm[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const response = await axios.get('/master/habits');
        if (response.data.success) {
          const fetchedHabits = response.data.data;
          setHabits(fetchedHabits);
          
          // Inisialisasi state form
          const initialForm = fetchedHabits.map((h: Habit) => ({
            habit_id: h.id,
            is_done: false,
            note: ''
          }));
          setFormState(initialForm);
        }
      } catch (error) {
        console.error('Gagal mengambil data habit', error);
        setErrorMsg('Gagal memuat daftar kebiasaan dari server.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHabits();
  }, []);

  const handleToggle = (habitId: number) => {
    setFormState(prev => prev.map(item => 
      item.habit_id === habitId ? { ...item, is_done: !item.is_done } : item
    ));
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
      // Ambil tanggal hari ini (format YYYY-MM-DD lokal)
      const today = new Date();
      const dateString = new Date(today.getTime() - (today.getTimezoneOffset() * 60000 ))
                    .toISOString()
                    .split("T")[0];

      const payload = {
        date: dateString,
        habits: formState
      };

      const response = await axios.post('/journals', payload);
      if (response.data.success) {
        setSuccessMsg('Jurnal hari ini berhasil dikirim!');
        // Opsional: disable form setelah sukses
      }
    } catch (error: any) {
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

      {/* Form List */}
      {!successMsg && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            {habits.map((habit, index) => {
              const state = formState.find(s => s.habit_id === habit.id);
              const isDone = state?.is_done || false;
              
              return (
                <div key={habit.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-gray-800 mb-1">
                        {index + 1}. {habit.name}
                      </h4>
                      
                      {/* Optional Note Input (Visible when turned ON) */}
                      <div className={`mt-3 transition-all duration-300 overflow-hidden ${isDone ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <input
                          type="text"
                          placeholder="Catatan tambahan (opsional)..."
                          value={state?.note || ''}
                          onChange={(e) => handleNoteChange(habit.id, e.target.value)}
                          className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggle(habit.id)}
                      className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isDone ? 'bg-[#4CAF50]' : 'bg-gray-200'}`}
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
      )}
    </div>
  );
};

export default JournalPage;
