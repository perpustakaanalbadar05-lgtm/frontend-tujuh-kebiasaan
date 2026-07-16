import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, Loader2, BookOpen, X, Check } from 'lucide-react';
import axios from '../../lib/axios';

interface SchoolClass {
  id: number;
  name: string;
  grade: string;
  active: boolean;
  academic_year_id: number;
}

const ClassListPage = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<SchoolClass | null>(null);
  const [form, setForm] = useState({ name: '', grade: '', academic_year_id: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (search) params.search = search;
      const res = await axios.get('/master/classes', { params });
      if (res.data.success) {
        const d = res.data.data;
        setClasses(d.data);
        setPagination({ current_page: d.current_page, last_page: d.last_page, total: d.total });
      }
    } catch { /* empty */ } finally { setIsLoading(false); }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditingItem(null); setForm({ name: '', grade: '', academic_year_id: '' }); setErrorMsg(''); setShowModal(true); };
  const openEdit = (c: SchoolClass) => { setEditingItem(c); setForm({ name: c.name, grade: c.grade, academic_year_id: String(c.academic_year_id) }); setErrorMsg(''); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const payload = { ...form, academic_year_id: Number(form.academic_year_id) || 1 };
      if (editingItem) {
        await axios.put(`/master/classes/${editingItem.id}`, payload);
      } else {
        await axios.post('/master/classes', payload);
      }
      setShowModal(false);
      fetchData(pagination.current_page);
    } catch (err: any) { setErrorMsg(err.response?.data?.message || 'Terjadi kesalahan'); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus kelas ini?')) return;
    try { await axios.delete(`/master/classes/${id}`); fetchData(pagination.current_page); } catch { /* empty */ }
  };

  const gradeOptions = ['1','2','3','4','5','6','7','8','9','10','11','12'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Data Kelas</h2>
          <p className="text-sm text-gray-500">Kelola data kelas dan rombongan belajar. Total: {pagination.total}</p>
        </div>
        <button onClick={openAdd} className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md">
          <Plus size={20} /> Tambah Kelas
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Cari kelas..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] transition-colors" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <Loader2 className="w-10 h-10 text-[#4CAF50] animate-spin mb-4" />
          <p className="text-gray-500">Memuat data kelas...</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Data Kelas Belum Tersedia</h3>
          <p className="text-gray-500 text-sm">Silakan tambahkan data kelas baru.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Kelas</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tingkat</th>
                <th className="text-center px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {classes.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">{c.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Kelas {c.grade}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${c.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {c.active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(c.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.last_page > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">Hal {pagination.current_page} / {pagination.last_page}</p>
              <div className="flex gap-2">
                <button onClick={() => fetchData(pagination.current_page - 1)} disabled={pagination.current_page === 1} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">Sebelumnya</button>
                <button onClick={() => fetchData(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">Selanjutnya</button>
              </div>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">{editingItem ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMsg}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Kelas *</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Contoh: Kelas 10-A"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tingkat *</label>
                <select required value={form.grade} onChange={e => setForm({...form, grade: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] bg-white">
                  <option value="">Pilih Tingkat</option>
                  {gradeOptions.map(g => <option key={g} value={g}>Kelas {g}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium text-white bg-[#4CAF50] hover:bg-[#388E3C] rounded-xl flex items-center gap-2 disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {editingItem ? 'Perbarui' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassListPage;
