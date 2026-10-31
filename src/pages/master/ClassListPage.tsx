import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, Loader2, BookOpen, X, Check } from 'lucide-react';
import axios from '../../lib/axios';
import SearchableSelect from '../../components/SearchableSelect';

interface AcademicYear {
  id: number;
  year: string;
  active: boolean;
}

interface SchoolClass {
  id: number;
  name: string;
  grade: string;
  active: boolean;
  academic_year_id: number;
  academic_year?: AcademicYear;
  teacher_id?: number;
  teacher?: { id: number; name: string };
}

interface Teacher {
  id: number;
  name: string;
}

const ClassListPage = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<SchoolClass | null>(null);
  const [form, setForm] = useState({ name: '', grade: '', academic_year_id: '', teacher_id: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  const fetchMetadata = async () => {
    try {
      const [resTeachers, resYears] = await Promise.all([
        axios.get('/master/teachers?per_page=1000'),
        axios.get('/master/academic-years')
      ]);

      if (resTeachers.data?.success) {
        setTeachers(resTeachers.data.data?.data || resTeachers.data.data || []);
      }
      if (resYears.data?.success) {
        setAcademicYears(resYears.data.data || []);
      }
    } catch { /* empty */ }
  };

  const fetchData = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (search) params.search = search;
      if (selectedYear) params.academic_year_id = selectedYear;

      const res = await axios.get('/master/classes', { params });
      if (res.data?.success) {
        const classArray = Array.isArray(res.data.data) ? res.data.data : [];
        setClasses(classArray);
        setPagination({ current_page: 1, last_page: 1, total: classArray.length });
      }
    } catch { /* empty */ } finally { setIsLoading(false); }
  }, [search, selectedYear]);

  useEffect(() => { 
    fetchMetadata();
  }, []);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  const openAdd = () => { 
    setEditingItem(null); 
    const activeYear = academicYears.find(y => y.active) || academicYears[0];
    setForm({ 
      name: '', 
      grade: '', 
      academic_year_id: activeYear ? String(activeYear.id) : '', 
      teacher_id: '' 
    }); 
    setErrorMsg(''); 
    setShowModal(true); 
  };

  const openEdit = (c: SchoolClass) => { 
    setEditingItem(c); 
    setForm({ 
      name: c.name, 
      grade: c.grade, 
      academic_year_id: c.academic_year_id ? String(c.academic_year_id) : '', 
      teacher_id: c.teacher_id ? String(c.teacher_id) : '' 
    }); 
    setErrorMsg(''); 
    setShowModal(true); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const payload = { 
        name: form.name.trim(),
        grade: form.grade,
        academic_year_id: form.academic_year_id ? Number(form.academic_year_id) : null,
        teacher_id: form.teacher_id ? Number(form.teacher_id) : null
      };

      if (editingItem) {
        await axios.put(`/master/classes/${editingItem.id}`, payload);
      } else {
        await axios.post('/master/classes', payload);
      }
      setShowModal(false);
      fetchData(pagination.current_page);
      fetchMetadata();
    } catch (err: any) { 
      const msg = err.response?.data?.message || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : 'Terjadi kesalahan saat menyimpan kelas');
      setErrorMsg(msg); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus kelas ini?')) return;
    try { 
      await axios.delete(`/master/classes/${id}`); 
      fetchData(pagination.current_page); 
    } catch { /* empty */ }
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
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari nama kelas atau tingkat..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] transition-colors" 
            />
          </div>
          {academicYears.length > 0 && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] bg-white text-sm text-gray-700 font-medium"
            >
              <option value="">Semua Tahun Ajaran</option>
              {academicYears.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.year} {y.active ? '(Aktif)' : ''}
                </option>
              ))}
            </select>
          )}
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
          <p className="text-gray-500 text-sm mb-4">Silakan tambahkan data kelas baru untuk sekolah Anda.</p>
          <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-[#4CAF50] text-white rounded-xl text-sm font-medium hover:bg-[#388E3C] transition-all">
            <Plus size={16} /> Tambah Kelas Sekarang
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Kelas</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tingkat</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Tahun Ajaran</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Wali Kelas</th>
                <th className="text-center px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {classes.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">{c.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Kelas {c.grade}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
                      {c.academic_year ? (
                        <span className="inline-flex items-center gap-1.5 font-medium text-gray-700">
                          {c.academic_year.year}
                          {c.academic_year.active && (
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" title="Aktif"></span>
                          )}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {c.teacher ? c.teacher.name : <span className="text-gray-400 italic">Belum diatur</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${c.active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500'}`}>
                        {c.active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(c)} title="Edit Kelas" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(c.id)} title="Hapus Kelas" className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
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
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                  {errorMsg}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Kelas *</label>
                <input 
                  type="text" 
                  required 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  placeholder="Contoh: 7A, 8B, atau Kelas 10-IPA-1"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tingkat *</label>
                <select 
                  required 
                  value={form.grade} 
                  onChange={e => setForm({...form, grade: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] bg-white"
                >
                  <option value="">Pilih Tingkat</option>
                  {gradeOptions.map(g => <option key={g} value={g}>Kelas {g}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tahun Ajaran</label>
                <select
                  value={form.academic_year_id}
                  onChange={e => setForm({...form, academic_year_id: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] bg-white text-gray-700"
                >
                  <option value="">Otomatis (Tahun Ajaran Aktif)</option>
                  {academicYears.map(y => (
                    <option key={y.id} value={y.id}>
                      {y.year} {y.active ? '— (Aktif)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Pilih tahun ajaran untuk rombongan belajar ini, atau biarkan default ke tahun aktif.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Wali Kelas (Opsional)</label>
                <SearchableSelect
                  value={form.teacher_id}
                  onChange={(val) => setForm({...form, teacher_id: String(val)})}
                  options={teachers.map(t => ({ value: t.id, label: t.name }))}
                  placeholder="Pilih Guru / Wali Kelas..."
                />
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
