import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, CalendarOff, X, Check } from 'lucide-react';
import axios from '../../lib/axios';

interface Holiday { id: number; title: string; date: string; type: string | null; }

const HolidayListPage = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Holiday | null>(null);
  const [form, setForm] = useState({ title: '', date: '', type: 'sekolah' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/master/holidays');
      if (res.data.success) setHolidays(res.data.data.data || res.data.data);
    } catch { /* empty */ } finally { setIsLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditingItem(null); setForm({ title: '', date: '', type: 'sekolah' }); setErrorMsg(''); setShowModal(true); };
  const openEdit = (h: Holiday) => { setEditingItem(h); setForm({ title: h.title, date: h.date, type: h.type || 'sekolah' }); setErrorMsg(''); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg('');
    try {
      if (editingItem) await axios.put(`/master/holidays/${editingItem.id}`, form);
      else await axios.post('/master/holidays', form);
      setShowModal(false); fetchData();
    } catch (err: any) { setErrorMsg(err.response?.data?.message || 'Error'); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus hari libur ini?')) return;
    try { await axios.delete(`/master/holidays/${id}`); fetchData(); } catch { /* empty */ }
  };

  if (isLoading) return <div className="flex flex-col items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 text-[#4CAF50] animate-spin mb-4" /><p className="text-gray-500">Memuat data...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-gray-800">Hari Libur</h2><p className="text-sm text-gray-500">Kelola hari libur nasional dan sekolah.</p></div>
        <button onClick={openAdd} className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm"><Plus size={20} /> Tambah</button>
      </div>

      {holidays.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center"><CalendarOff className="w-12 h-12 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-1">Belum Ada Hari Libur</h3></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"><table className="w-full"><thead><tr className="bg-gray-50 border-b border-gray-100">
          <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
          <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">Keterangan</th>
          <th className="text-center px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">Jenis</th>
          <th className="text-center px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
        </tr></thead><tbody className="divide-y divide-gray-50">
          {holidays.map(h => (
            <tr key={h.id} className="hover:bg-gray-50/50">
              <td className="px-6 py-4 text-sm font-medium text-gray-800">{new Date(h.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{h.title}</td>
              <td className="px-6 py-4 text-center"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${h.type === 'nasional' ? 'bg-red-50 text-red-700' : h.type === 'khusus' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>{h.type || 'Sekolah'}</span></td>
              <td className="px-6 py-4 text-center"><div className="flex items-center justify-center gap-1">
                <button onClick={() => openEdit(h)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(h.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div></td>
            </tr>
          ))}
        </tbody></table></div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100"><h3 className="text-lg font-bold text-gray-800">{editingItem ? 'Edit' : 'Tambah'} Hari Libur</h3><button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button></div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMsg}</p>}
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Keterangan *</label><input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal *</label><input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Jenis</label><select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white"><option value="sekolah">Sekolah</option><option value="nasional">Nasional</option><option value="khusus">Khusus</option></select></div>
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

export default HolidayListPage;
