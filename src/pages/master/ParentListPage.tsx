import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, Loader2, UserCheck, X, Check } from 'lucide-react';
import axios from '../../lib/axios';

interface Parent { id: number; name: string; email: string | null; phone: string | null; students?: { id: number; name: string; nis: string }[]; }

const ParentListPage = () => {
  const [parents, setParents] = useState<Parent[]>([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Parent | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', username: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (search) params.search = search;
      const res = await axios.get('/master/parents', { params });
      if (res.data.success) { const d = res.data.data; setParents(d.data); setPagination({ current_page: d.current_page, last_page: d.last_page, total: d.total }); }
    } catch { /* empty */ } finally { setIsLoading(false); }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditingItem(null); setForm({ name: '', email: '', phone: '', username: '' }); setErrorMsg(''); setShowModal(true); };
  const openEdit = (p: Parent) => { setEditingItem(p); setForm({ name: p.name, email: p.email || '', phone: p.phone || '', username: '' }); setErrorMsg(''); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg('');
    try {
      if (editingItem) { await axios.put(`/master/parents/${editingItem.id}`, form); }
      else { await axios.post('/master/parents', form); }
      setShowModal(false); fetchData(pagination.current_page);
    } catch (err: any) { setErrorMsg(err.response?.data?.message || 'Terjadi kesalahan'); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus data orang tua ini?')) return;
    try { await axios.delete(`/master/parents/${id}`); fetchData(pagination.current_page); } catch { /* empty */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-gray-800">Data Orang Tua</h2><p className="text-sm text-gray-500">Kelola data orang tua/wali siswa. Total: {pagination.total}</p></div>
        <button onClick={openAdd} className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md"><Plus size={20} /> Tambah Orang Tua</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Cari berdasarkan nama, email, atau telepon..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" /></div></div>

      {isLoading ? (<div className="flex flex-col items-center justify-center min-h-[40vh]"><Loader2 className="w-10 h-10 text-[#4CAF50] animate-spin mb-4" /><p className="text-gray-500">Memuat data...</p></div>
      ) : parents.length === 0 ? (<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center"><UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-1">Data Orang Tua Belum Tersedia</h3><p className="text-gray-500 text-sm">Silakan tambahkan data orang tua.</p></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full"><thead><tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">Nama</th>
            <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Email</th>
            <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Telepon</th>
            <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Anak</th>
            <th className="text-center px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
          </tr></thead><tbody className="divide-y divide-gray-50">
            {parents.map(p => (
              <tr key={p.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-semibold text-gray-800">{p.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{p.email || '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{p.phone || '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{p.students?.map(s => s.name).join(', ') || '—'}</td>
                <td className="px-6 py-4 text-center"><div className="flex items-center justify-center gap-1">
                  <button onClick={() => openEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                </div></td>
              </tr>
            ))}
          </tbody></table></div>
          {pagination.last_page > 1 && (<div className="flex items-center justify-between px-6 py-4 border-t border-gray-100"><p className="text-sm text-gray-500">Hal {pagination.current_page} / {pagination.last_page}</p><div className="flex gap-2"><button onClick={() => fetchData(pagination.current_page - 1)} disabled={pagination.current_page === 1} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">Sebelumnya</button><button onClick={() => fetchData(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">Selanjutnya</button></div></div>)}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100"><h3 className="text-lg font-bold text-gray-800">{editingItem ? 'Edit Orang Tua' : 'Tambah Orang Tua'}</h3><button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button></div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMsg}</p>}
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap *</label><input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" /></div>
            {!editingItem && <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Username *</label><input type="text" required value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" placeholder="Untuk login" /></div>}
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Telepon</label><input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" /></div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50">Batal</button>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium text-white bg-[#4CAF50] hover:bg-[#388E3C] rounded-xl flex items-center gap-2 disabled:opacity-50">{isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} {editingItem ? 'Perbarui' : 'Simpan'}</button>
            </div>
          </form>
        </div></div>
      )}
    </div>
  );
};

export default ParentListPage;
