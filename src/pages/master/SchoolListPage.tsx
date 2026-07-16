import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Building, X, Check } from 'lucide-react';
import axios from '../../lib/axios';

interface School { id: number; name: string; npsn: string | null; email: string | null; phone: string | null; address: string | null; status: string; }

const SchoolListPage = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<School | null>(null);
  const [form, setForm] = useState({ name: '', npsn: '', email: '', phone: '', address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try { const res = await axios.get('/master/schools'); if (res.data.success) setSchools(res.data.data.data || res.data.data); } catch { /* empty */ } finally { setIsLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditingItem(null); setForm({ name: '', npsn: '', email: '', phone: '', address: '' }); setErrorMsg(''); setShowModal(true); };
  const openEdit = (s: School) => { setEditingItem(s); setForm({ name: s.name, npsn: s.npsn || '', email: s.email || '', phone: s.phone || '', address: s.address || '' }); setErrorMsg(''); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg('');
    try {
      if (editingItem) await axios.put(`/master/schools/${editingItem.id}`, form);
      else await axios.post('/master/schools', form);
      setShowModal(false); fetchData();
    } catch (err: any) { setErrorMsg(err.response?.data?.message || 'Error'); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => { if (!confirm('Hapus sekolah ini?')) return; try { await axios.delete(`/master/schools/${id}`); fetchData(); } catch { /* empty */ } };
  const toggleStatus = async (id: number) => { try { await axios.patch(`/master/schools/${id}/status`); fetchData(); } catch { /* empty */ } };

  if (isLoading) return <div className="flex flex-col items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 text-[#4CAF50] animate-spin mb-4" /><p className="text-gray-500">Memuat data...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-gray-800">Daftar Sekolah</h2><p className="text-sm text-gray-500">Kelola data institusi sekolah yang terdaftar.</p></div>
        <button onClick={openAdd} className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm"><Plus size={20} /> Tambah Sekolah</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {schools.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center"><Building className="w-12 h-12 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900">Belum Ada Sekolah</h3></div>
        ) : schools.map(s => (
          <div key={s.id} className={`bg-white rounded-xl shadow-sm border ${s.status === 'active' ? 'border-gray-100' : 'border-gray-200 bg-gray-50 opacity-75'} p-5 flex flex-col`}>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-bold text-xl">{s.name.charAt(0)}</div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{s.status === 'active' ? 'Aktif' : 'Nonaktif'}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">{s.name}</h3>
            <p className="text-sm text-gray-500 mb-4 flex-1">NPSN: {s.npsn || '—'}</p>
            <div className="text-sm text-gray-600 space-y-1 mb-4">
              <p>Email: {s.email || '—'}</p>
              <p>Telp: {s.phone || '—'}</p>
              <p className="truncate">Alamat: {s.address || '—'}</p>
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <button onClick={() => toggleStatus(s.id)} className={`text-sm font-medium ${s.status === 'active' ? 'text-amber-600' : 'text-green-600'}`}>{s.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}</button>
              <div className="flex gap-1">
                <button onClick={() => openEdit(s)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(s.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100"><h3 className="text-lg font-bold text-gray-800">{editingItem ? 'Edit' : 'Tambah'} Sekolah</h3><button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button></div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMsg}</p>}
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Sekolah *</label><input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">NPSN</label><input type="text" value={form.npsn} onChange={e => setForm({...form, npsn: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Telepon</label><input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30" /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat</label><textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30" /></div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50">Batal</button>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium text-white bg-[#4CAF50] hover:bg-[#388E3C] rounded-xl flex items-center gap-2 disabled:opacity-50">{isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Simpan</button>
            </div>
          </form>
        </div></div>
      )}
    </div>
  );
};

export default SchoolListPage;
