import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Calendar, X, Check, Star } from 'lucide-react';
import axios from '../../lib/axios';

interface AcademicYear { id: number; year: string; active: boolean; }
interface Semester { id: number; semester: string; active: boolean; academic_year_id: number; academic_year?: AcademicYear; }

const AcademicYearListPage = () => {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showYearModal, setShowYearModal] = useState(false);
  const [showSemModal, setShowSemModal] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [yearForm, setYearForm] = useState({ year: '' });
  const [semForm, setSemForm] = useState({ academic_year_id: '', semester: 'Ganjil' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [yRes, sRes] = await Promise.all([
        axios.get('/master/academic-years'),
        axios.get('/master/semesters'),
      ]);
      if (yRes.data.success) setYears(yRes.data.data.data || yRes.data.data);
      if (sRes.data.success) setSemesters(sRes.data.data.data || sRes.data.data);
    } catch { /* empty */ } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleYearSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg('');
    try {
      if (editingYear) { await axios.put(`/master/academic-years/${editingYear.id}`, yearForm); }
      else { await axios.post('/master/academic-years', yearForm); }
      setShowYearModal(false); fetchAll();
    } catch (err: any) { setErrorMsg(err.response?.data?.message || 'Error'); } finally { setIsSubmitting(false); }
  };

  const handleSemSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setErrorMsg('');
    try {
      await axios.post('/master/semesters', { ...semForm, academic_year_id: Number(semForm.academic_year_id) });
      setShowSemModal(false); fetchAll();
    } catch (err: any) { setErrorMsg(err.response?.data?.message || 'Error'); } finally { setIsSubmitting(false); }
  };

  const activateSemester = async (id: number) => {
    try { await axios.patch(`/master/semesters/${id}/active`); fetchAll(); } catch { /* empty */ }
  };

  const deleteYear = async (id: number) => {
    if (!confirm('Hapus tahun ajaran ini?')) return;
    try { await axios.delete(`/master/academic-years/${id}`); fetchAll(); } catch { /* empty */ }
  };

  const deleteSem = async (id: number) => {
    if (!confirm('Hapus semester ini?')) return;
    try { await axios.delete(`/master/semesters/${id}`); fetchAll(); } catch { /* empty */ }
  };

  if (isLoading) return <div className="flex flex-col items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 text-[#4CAF50] animate-spin mb-4" /><p className="text-gray-500">Memuat data...</p></div>;

  return (
    <div className="space-y-8">
      {/* Tahun Ajaran */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div><h2 className="text-2xl font-bold text-gray-800">Tahun Ajaran</h2><p className="text-sm text-gray-500">Kelola periode tahun ajaran sekolah.</p></div>
          <button onClick={() => { setEditingYear(null); setYearForm({ year: '' }); setErrorMsg(''); setShowYearModal(true); }} className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm hover:shadow-md transition-all"><Plus size={18} /> Tambah</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {years.map(y => (
            <div key={y.id} className={`bg-white rounded-xl border p-5 ${y.active ? 'border-[#4CAF50] ring-1 ring-[#4CAF50]/20' : 'border-gray-100'} shadow-sm hover:shadow-md transition-all`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${y.active ? 'bg-[#E8F5E9]' : 'bg-gray-100'}`}>
                    <Calendar className={`w-5 h-5 ${y.active ? 'text-[#4CAF50]' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{y.year}</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${y.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{y.active ? '● Aktif' : 'Arsip'}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingYear(y); setYearForm({ year: y.year }); setErrorMsg(''); setShowYearModal(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={14} /></button>
                  <button onClick={() => deleteYear(y.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Semester */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div><h2 className="text-2xl font-bold text-gray-800">Semester</h2><p className="text-sm text-gray-500">Kelola semester per tahun ajaran.</p></div>
          <button onClick={() => { setSemForm({ academic_year_id: years[0]?.id?.toString() || '', semester: 'Ganjil' }); setErrorMsg(''); setShowSemModal(true); }} className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm hover:shadow-md transition-all"><Plus size={18} /> Tambah</button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">Tahun Ajaran</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">Semester</th>
              <th className="text-center px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-center px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {semesters.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-sm text-gray-700">{s.academic_year?.year || '—'}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{s.semester}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${s.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{s.active ? '● Aktif' : 'Nonaktif'}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {!s.active && <button onClick={() => activateSemester(s.id)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg" title="Aktifkan"><Star size={16} /></button>}
                      <button onClick={() => deleteSem(s.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tahun Ajaran */}
      {showYearModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">{editingYear ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran'}</h3>
              <button onClick={() => setShowYearModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button>
            </div>
            <form onSubmit={handleYearSubmit} className="p-6 space-y-4">
              {errorMsg && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMsg}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tahun Ajaran *</label>
                <input type="text" required value={yearForm.year} onChange={e => setYearForm({year: e.target.value})} placeholder="Contoh: 2026/2027"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowYearModal(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium text-white bg-[#4CAF50] hover:bg-[#388E3C] rounded-xl flex items-center gap-2 disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Semester */}
      {showSemModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Tambah Semester</h3>
              <button onClick={() => setShowSemModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button>
            </div>
            <form onSubmit={handleSemSubmit} className="p-6 space-y-4">
              {errorMsg && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMsg}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tahun Ajaran *</label>
                <select required value={semForm.academic_year_id} onChange={e => setSemForm({...semForm, academic_year_id: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 bg-white">
                  {years.map(y => <option key={y.id} value={y.id}>{y.year}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Semester *</label>
                <select required value={semForm.semester} onChange={e => setSemForm({...semForm, semester: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 bg-white">
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowSemModal(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium text-white bg-[#4CAF50] hover:bg-[#388E3C] rounded-xl flex items-center gap-2 disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicYearListPage;
