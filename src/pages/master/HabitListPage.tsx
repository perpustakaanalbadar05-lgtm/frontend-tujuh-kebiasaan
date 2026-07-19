import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Sparkles, X, Check, GripVertical } from 'lucide-react';
import axios from '../../lib/axios';

interface Habit { id: number; name: string; order_number: number; active: boolean; start_time?: string; end_time?: string; }

const HabitListPage = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Habit | null>(null);
  const [form, setForm] = useState({ name: '', order_number: 1, start_time: '', end_time: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try { const res = await axios.get('/master/habits'); if (res.data.success) setHabits(res.data.data.data || res.data.data); } catch { /* empty */ } finally { setIsLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditingItem(null); setForm({ name: '', order_number: habits.length + 1, start_time: '', end_time: '' }); setErrorMsg(''); setShowModal(true); };
  const openEdit = (h: Habit) => { setEditingItem(h); setForm({ name: h.name, order_number: h.order_number, start_time: h.start_time?.substring(0,5) || '', end_time: h.end_time?.substring(0,5) || '' }); setErrorMsg(''); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg('');
    try {
      if (editingItem) await axios.put(`/master/habits/${editingItem.id}`, form);
      else await axios.post('/master/habits', form);
      setShowModal(false); fetchData();
    } catch (err: any) { setErrorMsg(err.response?.data?.message || 'Error'); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => { if (!confirm('Hapus kebiasaan ini?')) return; try { await axios.delete(`/master/habits/${id}`); fetchData(); } catch { /* empty */ } };

  if (isLoading) return <div className="flex flex-col items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 text-[#4CAF50] animate-spin mb-4" /><p className="text-gray-500">Memuat data...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-gray-800">7 Kebiasaan</h2><p className="text-sm text-gray-500">Kelola daftar kebiasaan yang dipantau.</p></div>
        <button onClick={openAdd} className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm"><Plus size={20} /> Tambah</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
        {habits.length === 0 ? (
          <div className="p-12 text-center"><Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900">Belum Ada Kebiasaan</h3></div>
        ) : habits.map((h) => (
          <div key={h.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
            <GripVertical className="w-5 h-5 text-gray-300 flex-shrink-0 cursor-grab" />
            <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center text-sm font-bold text-[#4CAF50] flex-shrink-0">{h.order_number}</div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">{h.name}</p>
              {h.start_time && h.end_time && (
                <p className="text-xs text-gray-500 mt-0.5">Jam: {h.start_time.substring(0,5)} - {h.end_time.substring(0,5)}</p>
              )}
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${h.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{h.active ? 'Aktif' : 'Nonaktif'}</span>
            <div className="flex gap-1">
              <button onClick={() => openEdit(h)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
              <button onClick={() => handleDelete(h.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100"><h3 className="text-lg font-bold text-gray-800">{editingItem ? 'Edit' : 'Tambah'} Kebiasaan</h3><button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button></div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMsg}</p>}
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Kebiasaan *</label><input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Contoh: Bangun Pagi" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor Urut *</label><input type="number" required min="1" value={form.order_number} onChange={e => setForm({...form, order_number: parseInt(e.target.value) || 1})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Jam Mulai (Opsional)</label><input type="time" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Jam Berakhir (Opsional)</label><input type="time" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30" /></div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50">Batal</button>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm text-white bg-[#4CAF50] hover:bg-[#388E3C] rounded-xl flex items-center gap-2 disabled:opacity-50">{isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Simpan</button>
            </div>
          </form>
        </div></div>
      )}
    </div>
  );
};

export default HabitListPage;
