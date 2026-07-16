import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Award, X, Check } from 'lucide-react';
import axios from '../../lib/axios';

interface Predicate { id: number; name: string; min_score: number; max_score: number; }

const PredicateListPage = () => {
  const [predicates, setPredicates] = useState<Predicate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Predicate | null>(null);
  const [form, setForm] = useState({ name: '', min_score: 0, max_score: 100 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try { const res = await axios.get('/master/predicates'); if (res.data.success) setPredicates(res.data.data.data || res.data.data); } catch { /* empty */ } finally { setIsLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditingItem(null); setForm({ name: '', min_score: 0, max_score: 100 }); setErrorMsg(''); setShowModal(true); };
  const openEdit = (p: Predicate) => { setEditingItem(p); setForm({ name: p.name, min_score: p.min_score, max_score: p.max_score }); setErrorMsg(''); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg('');
    try {
      if (editingItem) await axios.put(`/master/predicates/${editingItem.id}`, form);
      else await axios.post('/master/predicates', form);
      setShowModal(false); fetchData();
    } catch (err: any) { setErrorMsg(err.response?.data?.message || 'Error'); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => { if (!confirm('Hapus predikat ini?')) return; try { await axios.delete(`/master/predicates/${id}`); fetchData(); } catch { /* empty */ } };

  if (isLoading) return <div className="flex flex-col items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 text-[#4CAF50] animate-spin mb-4" /><p className="text-gray-500">Memuat data...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-gray-800">Predikat Penilaian</h2><p className="text-sm text-gray-500">Kelola standar nilai predikat di rapor/monitoring.</p></div>
        <button onClick={openAdd} className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm"><Plus size={20} /> Tambah Predikat</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {predicates.length === 0 ? (
          <div className="p-12 text-center"><Award className="w-12 h-12 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900">Belum Ada Predikat</h3></div>
        ) : <table className="w-full"><thead><tr className="bg-gray-50 border-b border-gray-100">
          <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">Nama Predikat</th>
          <th className="text-center px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">Batas Nilai</th>
          <th className="text-center px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
        </tr></thead><tbody className="divide-y divide-gray-50">
          {predicates.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50/50">
              <td className="px-6 py-4 font-semibold text-gray-800">{p.name}</td>
              <td className="px-6 py-4 text-center">
                <span className="inline-flex px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">{p.min_score} — {p.max_score}</span>
              </td>
              <td className="px-6 py-4 text-center"><div className="flex items-center justify-center gap-1">
                <button onClick={() => openEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div></td>
            </tr>
          ))}
        </tbody></table>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100"><h3 className="text-lg font-bold text-gray-800">{editingItem ? 'Edit' : 'Tambah'} Predikat</h3><button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button></div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMsg}</p>}
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Predikat *</label><input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Contoh: Sangat Terbiasa" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Nilai Minimum *</label><input type="number" min="0" max="100" required value={form.min_score} onChange={e => setForm({...form, min_score: Number(e.target.value)})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Nilai Maksimum *</label><input type="number" min="0" max="100" required value={form.max_score} onChange={e => setForm({...form, max_score: Number(e.target.value)})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30" /></div>
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

export default PredicateListPage;
