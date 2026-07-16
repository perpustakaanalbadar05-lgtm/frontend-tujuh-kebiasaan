import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Link, X, Check } from 'lucide-react';
import axios from '../../lib/axios';

const MappingPage = () => {
  const [tab, setTab] = useState<'teacher_class' | 'parent_student'>('teacher_class');
  const [mappings, setMappings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  
  const [form, setForm] = useState({ teacher_id: '', class_id: '', parent_id: '', student_id: '', relationship: 'Ayah' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchMappings = async () => {
    setIsLoading(true);
    try {
      const endpoint = tab === 'teacher_class' ? '/master/mappings/teacher-classes' : '/master/mappings/parent-students';
      const res = await axios.get(endpoint);
      if (res.data.success) setMappings(res.data.data);
    } catch { /* empty */ } finally { setIsLoading(false); }
  };

  const fetchOptions = async () => {
    try {
      if (tab === 'teacher_class') {
        const [t, c] = await Promise.all([axios.get('/master/teachers?per_page=100'), axios.get('/master/classes?per_page=100')]);
        setTeachers(t.data.data.data || t.data.data); setClasses(c.data.data.data || c.data.data);
      } else {
        const [p, s] = await Promise.all([axios.get('/master/parents?per_page=100'), axios.get('/master/students?per_page=100')]);
        setParents(p.data.data.data || p.data.data); setStudents(s.data.data.data || s.data.data);
      }
    } catch { /* empty */ }
  };

  useEffect(() => { fetchMappings(); }, [tab]);

  const openAdd = () => { fetchOptions(); setForm({ teacher_id: '', class_id: '', parent_id: '', student_id: '', relationship: 'Ayah' }); setErrorMsg(''); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg('');
    try {
      const endpoint = tab === 'teacher_class' ? '/master/mappings/teacher-classes' : '/master/mappings/parent-students';
      await axios.post(endpoint, form);
      setShowModal(false); fetchMappings();
    } catch (err: any) { setErrorMsg(err.response?.data?.message || 'Error'); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus pemetaan ini?')) return;
    try {
      const endpoint = tab === 'teacher_class' ? `/master/mappings/teacher-classes/${id}` : `/master/mappings/parent-students/${id}`;
      await axios.delete(endpoint); fetchMappings();
    } catch { /* empty */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-gray-800">Pemetaan (Mapping)</h2><p className="text-sm text-gray-500">Kelola relasi data Guru-Kelas dan Orang Tua-Siswa.</p></div>
        <button onClick={openAdd} className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm"><Plus size={20} /> Tambah Pemetaan</button>
      </div>

      <div className="flex bg-white rounded-xl border border-gray-200 p-1 shadow-sm w-fit">
        <button onClick={() => setTab('teacher_class')} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'teacher_class' ? 'bg-[#4CAF50] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>Guru & Wali Kelas</button>
        <button onClick={() => setTab('parent_student')} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'parent_student' ? 'bg-[#4CAF50] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>Orang Tua & Siswa</button>
      </div>

      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-10 h-10 text-[#4CAF50] animate-spin" /></div> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {mappings.length === 0 ? (
             <div className="p-12 text-center"><Link className="w-12 h-12 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900">Belum Ada Pemetaan</h3></div>
          ) : (
            <table className="w-full">
              <thead><tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">{tab === 'teacher_class' ? 'Guru Wali' : 'Orang Tua'}</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">{tab === 'teacher_class' ? 'Ditempatkan di Kelas' : 'Nama Anak / Siswa'}</th>
                {tab === 'parent_student' && <th className="text-center px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">Relasi</th>}
                <th className="text-center px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {mappings.map((m: any) => (
                  <tr key={m.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-semibold text-gray-800">{tab === 'teacher_class' ? m.teacher_name : m.parent_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{tab === 'teacher_class' ? m.class_name : m.student_name}</td>
                    {tab === 'parent_student' && <td className="px-6 py-4 text-center"><span className="inline-flex px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{m.relationship || 'Wali'}</span></td>}
                    <td className="px-6 py-4 text-center"><button onClick={() => handleDelete(m.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100"><h3 className="text-lg font-bold text-gray-800">Tambah Pemetaan {tab === 'teacher_class' ? 'Guru' : 'Orang Tua'}</h3><button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button></div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMsg}</p>}
            
            {tab === 'teacher_class' ? (
              <>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Pilih Guru *</label><select required value={form.teacher_id} onChange={e => setForm({...form, teacher_id: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 bg-white"><option value="">Pilih...</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Pilih Kelas *</label><select required value={form.class_id} onChange={e => setForm({...form, class_id: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 bg-white"><option value="">Pilih...</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              </>
            ) : (
              <>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Pilih Orang Tua *</label><select required value={form.parent_id} onChange={e => setForm({...form, parent_id: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 bg-white"><option value="">Pilih...</option>{parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Pilih Siswa (Anak) *</label><select required value={form.student_id} onChange={e => setForm({...form, student_id: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 bg-white"><option value="">Pilih...</option>{students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Relasi</label><select required value={form.relationship} onChange={e => setForm({...form, relationship: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 bg-white"><option value="Ayah">Ayah</option><option value="Ibu">Ibu</option><option value="Wali">Wali</option></select></div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50">Batal</button>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm text-white bg-[#4CAF50] hover:bg-[#388E3C] rounded-xl flex items-center gap-2 disabled:opacity-50">{isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Simpan Pemetaan</button>
            </div>
          </form>
        </div></div>
      )}
    </div>
  );
};

export default MappingPage;
