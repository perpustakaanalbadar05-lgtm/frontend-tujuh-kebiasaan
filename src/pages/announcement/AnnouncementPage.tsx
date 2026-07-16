import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Megaphone, X, Check } from 'lucide-react';
import axios from '../../lib/axios';
import { useAuth } from '../../contexts/AuthContext';

interface Announcement { id: number; title: string; content: string; is_active: boolean; created_at: string; school_id: number | null; }

const AnnouncementPage = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Admin only logic
  const isAdmin = user?.role === 'superadmin' || user?.role === 'admin';
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [form, setForm] = useState({ title: '', content: '', is_active: true });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try { const res = await axios.get('/announcements'); if (res.data.success) setAnnouncements(res.data.data.data || res.data.data); } catch { /* empty */ } finally { setIsLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditingItem(null); setForm({ title: '', content: '', is_active: true }); setErrorMsg(''); setShowModal(true); };
  const openEdit = (a: Announcement) => { setEditingItem(a); setForm({ title: a.title, content: a.content, is_active: a.is_active }); setErrorMsg(''); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg('');
    try {
      if (editingItem) await axios.put(`/announcements/${editingItem.id}`, form);
      else await axios.post('/announcements', form);
      setShowModal(false); fetchData();
    } catch (err: any) { setErrorMsg(err.response?.data?.message || 'Error'); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => { if (!confirm('Hapus pengumuman ini?')) return; try { await axios.delete(`/announcements/${id}`); fetchData(); } catch { /* empty */ } };

  if (isLoading) return <div className="flex flex-col items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 text-[#4CAF50] animate-spin mb-4" /><p className="text-gray-500">Memuat data...</p></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-gray-800">Pengumuman</h2><p className="text-sm text-gray-500">Informasi dan pemberitahuan penting.</p></div>
        {isAdmin && <button onClick={openAdd} className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm"><Plus size={20} /> Buat Pengumuman</button>}
      </div>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center"><Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900">Belum Ada Pengumuman</h3></div>
        ) : announcements.map(a => (
          <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
            <div className="hidden sm:flex w-14 h-14 rounded-full bg-blue-50 items-center justify-center flex-shrink-0">
              <Megaphone className="w-7 h-7 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-gray-800">{a.title}</h3>
                {!a.school_id && <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 rounded-full">Sistem</span>}
              </div>
              <p className="text-xs text-gray-500 mb-4">{new Date(a.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })}</p>
              <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{a.content}</div>
            </div>
            {isAdmin && a.school_id && (
              <div className="flex sm:flex-col gap-2 pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-gray-100 sm:pl-6 justify-center">
                <button onClick={() => openEdit(a)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /> Edit</button>
                <button onClick={() => handleDelete(a.id)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /> Hapus</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl shadow-xl w-full max-w-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100"><h3 className="text-lg font-bold text-gray-800">{editingItem ? 'Edit' : 'Buat'} Pengumuman</h3><button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button></div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMsg}</p>}
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Judul *</label><input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Isi Pengumuman *</label><textarea required value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={6} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30" /></div>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="rounded text-[#4CAF50] focus:ring-[#4CAF50]" /><span className="text-sm text-gray-700">Tampilkan pengumuman ini (Aktif)</span></label>
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

export default AnnouncementPage;
