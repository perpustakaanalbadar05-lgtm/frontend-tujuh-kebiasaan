import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Loader2, Link, X, Check } from 'lucide-react';
import axios from '../../lib/axios';

const MappingPage = () => {
  const [tab, setTab] = useState<'teacher_class' | 'parent_student' | 'teacher_student'>('teacher_class');
  const [mappings, setMappings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  
  // For teacher-student filtering
  const [selectedClassId, setSelectedClassId] = useState('');
  
  const [form, setForm] = useState({ 
    teacher_id: '', 
    class_id: '', 
    parent_id: '', 
    student_id: '', 
    relationship: 'Ayah',
    student_ids: [] as string[]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchMappings = useCallback(async () => {
    setIsLoading(true);
    try {
      let endpoint = '';
      if (tab === 'teacher_class') endpoint = '/master/mappings/teacher-classes';
      else if (tab === 'parent_student') endpoint = '/master/mappings/parent-students';
      else endpoint = '/master/mappings/teacher-students';
      
      const res = await axios.get(endpoint);
      if (res.data.success) setMappings(res.data.data);
    } catch { /* empty */ } finally { setIsLoading(false); }
  }, [tab]);

  const fetchOptions = async () => {
    try {
      if (tab === 'teacher_class') {
        const [t, c] = await Promise.all([axios.get('/master/teachers?per_page=100'), axios.get('/master/classes?per_page=100')]);
        setTeachers(t.data.data.data || t.data.data); setClasses(c.data.data.data || c.data.data);
      } else if (tab === 'parent_student') {
        const [p, s] = await Promise.all([axios.get('/master/parents?per_page=100'), axios.get('/master/students?per_page=100')]);
        setParents(p.data.data.data || p.data.data); setStudents(s.data.data.data || s.data.data);
      } else if (tab === 'teacher_student') {
        const [t, c, s] = await Promise.all([
          axios.get('/master/teachers?per_page=100'), 
          axios.get('/master/classes?per_page=100'),
          axios.get('/master/students?per_page=1000') // Ambil agak banyak untuk filter kelas
        ]);
        setTeachers(t.data.data.data || t.data.data); 
        setClasses(c.data.data.data || c.data.data);
        setStudents(s.data.data.data || s.data.data);
      }
    } catch { /* empty */ }
  };

  useEffect(() => { fetchMappings(); }, [fetchMappings]);

  const openAdd = () => { 
    fetchOptions(); 
    setSelectedClassId('');
    setForm({ teacher_id: '', class_id: '', parent_id: '', student_id: '', relationship: 'Ayah', student_ids: [] }); 
    setErrorMsg(''); 
    setShowModal(true); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setIsSubmitting(true); 
    setErrorMsg('');
    try {
      let endpoint = '';
      if (tab === 'teacher_class') endpoint = '/master/mappings/teacher-classes';
      else if (tab === 'parent_student') endpoint = '/master/mappings/parent-students';
      else endpoint = '/master/mappings/teacher-students/bulk';

      await axios.post(endpoint, form);
      setShowModal(false); 
      fetchMappings();
    } catch (err: any) { 
      setErrorMsg(err.response?.data?.message || 'Error occurred while saving mapping'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus pemetaan ini?')) return;
    try {
      let endpoint = '';
      if (tab === 'teacher_class') endpoint = `/master/mappings/teacher-classes/${id}`;
      else if (tab === 'parent_student') endpoint = `/master/mappings/parent-students/${id}`;
      else endpoint = `/master/mappings/teacher-students/${id}`;
      
      await axios.delete(endpoint); 
      fetchMappings();
    } catch { /* empty */ }
  };

  // Toggle checkbox for student multiple selection
  const handleStudentToggle = (studentId: string) => {
    setForm(prev => {
      const isSelected = prev.student_ids.includes(studentId);
      if (isSelected) {
        return { ...prev, student_ids: prev.student_ids.filter(id => id !== studentId) };
      } else {
        return { ...prev, student_ids: [...prev.student_ids, studentId] };
      }
    });
  };

  // Select all visible students
  const handleSelectAllVisible = (visibleStudents: any[]) => {
    const visibleIds = visibleStudents.map(s => s.id.toString());
    const allSelected = visibleIds.every(id => form.student_ids.includes(id));
    
    if (allSelected) {
      setForm(prev => ({ ...prev, student_ids: prev.student_ids.filter(id => !visibleIds.includes(id)) }));
    } else {
      setForm(prev => {
        const newIds = new Set([...prev.student_ids, ...visibleIds]);
        return { ...prev, student_ids: Array.from(newIds) };
      });
    }
  };

  const filteredStudents = selectedClassId 
    ? students.filter(s => s.class_id?.toString() === selectedClassId.toString())
    : students;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pemetaan (Mapping)</h2>
          <p className="text-sm text-gray-500">Kelola relasi data Guru, Wali Kelas, Orang Tua, dan Validator.</p>
        </div>
        <button onClick={openAdd} className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm">
          <Plus size={20} /> Tambah Pemetaan
        </button>
      </div>

      <div className="flex flex-wrap bg-white rounded-xl border border-gray-200 p-1 shadow-sm w-fit gap-1">
        <button onClick={() => setTab('teacher_class')} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'teacher_class' ? 'bg-[#4CAF50] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>Guru & Kelas</button>
        <button onClick={() => setTab('teacher_student')} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'teacher_student' ? 'bg-[#4CAF50] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>Guru Validator & Siswa</button>
        <button onClick={() => setTab('parent_student')} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'parent_student' ? 'bg-[#4CAF50] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>Orang Tua & Siswa</button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-10 h-10 text-[#4CAF50] animate-spin" /></div> 
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {mappings.length === 0 ? (
             <div className="p-12 text-center"><Link className="w-12 h-12 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900">Belum Ada Pemetaan</h3></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">
                      {tab === 'parent_student' ? 'Orang Tua' : (tab === 'teacher_student' ? 'Guru Validator' : 'Guru / Wali Kelas')}
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">
                      {tab === 'teacher_class' ? 'Ditempatkan di Kelas' : 'Nama Anak / Siswa'}
                    </th>
                    {tab === 'teacher_student' && <th className="text-center px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">Kelas Siswa</th>}
                    {tab === 'parent_student' && <th className="text-center px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">Relasi</th>}
                    <th className="text-center px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {mappings.map((m: any) => (
                    <tr key={m.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {tab === 'parent_student' ? m.parent_name : m.teacher_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {tab === 'teacher_class' ? m.class_name : m.student_name}
                      </td>
                      {tab === 'teacher_student' && (
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                            {m.class_name}
                          </span>
                        </td>
                      )}
                      {tab === 'parent_student' && (
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{m.relationship || 'Wali'}</span>
                        </td>
                      )}
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleDelete(tab === 'teacher_student' ? m.student_id : m.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`bg-white rounded-2xl shadow-xl w-full ${tab === 'teacher_student' ? 'max-w-2xl' : 'max-w-md'} flex flex-col max-h-[90vh]`}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h3 className="text-lg font-bold text-gray-800">
                Tambah Pemetaan {tab === 'teacher_class' ? 'Guru' : (tab === 'teacher_student' ? 'Validator' : 'Orang Tua')}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6">
              <form id="mapping-form" onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMsg}</p>}
                
                {tab === 'teacher_class' && (
                  <>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Pilih Guru *</label><select required value={form.teacher_id} onChange={e => setForm({...form, teacher_id: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 bg-white"><option value="">Pilih...</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Pilih Kelas *</label><select required value={form.class_id} onChange={e => setForm({...form, class_id: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 bg-white"><option value="">Pilih...</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                  </>
                )}

                {tab === 'parent_student' && (
                  <>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Pilih Orang Tua *</label><select required value={form.parent_id} onChange={e => setForm({...form, parent_id: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 bg-white"><option value="">Pilih...</option>{parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Pilih Siswa (Anak) *</label><select required value={form.student_id} onChange={e => setForm({...form, student_id: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 bg-white"><option value="">Pilih...</option>{students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Relasi</label><select required value={form.relationship} onChange={e => setForm({...form, relationship: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 bg-white"><option value="Ayah">Ayah</option><option value="Ibu">Ibu</option><option value="Wali">Wali</option></select></div>
                  </>
                )}

                {tab === 'teacher_student' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Pilih Guru Validator *</label>
                      <select required value={form.teacher_id} onChange={e => setForm({...form, teacher_id: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 bg-white">
                        <option value="">Pilih...</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Tugaskan ke Siswa *</label>
                        <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} className="text-sm px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg outline-none">
                          <option value="">Semua Kelas</option>
                          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>

                      <div className="bg-gray-50 rounded-xl border border-gray-200 p-2 h-64 overflow-y-auto">
                        <div className="flex items-center p-2 hover:bg-gray-100 rounded-lg cursor-pointer border-b border-gray-200 mb-1" onClick={() => handleSelectAllVisible(filteredStudents)}>
                          <input type="checkbox" className="w-4 h-4 text-[#4CAF50] rounded border-gray-300 focus:ring-[#4CAF50]" 
                            checked={filteredStudents.length > 0 && filteredStudents.every(s => form.student_ids.includes(s.id.toString()))} 
                            readOnly 
                          />
                          <span className="ml-3 text-sm font-bold text-gray-700">Pilih Semua ({filteredStudents.length})</span>
                        </div>
                        
                        {filteredStudents.length === 0 && <p className="text-center text-sm text-gray-500 py-4">Tidak ada data siswa.</p>}
                        
                        {filteredStudents.map(s => (
                          <label key={s.id} className="flex items-center p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 text-[#4CAF50] rounded border-gray-300 focus:ring-[#4CAF50]" 
                              checked={form.student_ids.includes(s.id.toString())}
                              onChange={() => handleStudentToggle(s.id.toString())}
                            />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-800">{s.name}</p>
                              <p className="text-xs text-gray-500">NIS: {s.nis}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{form.student_ids.length} siswa dipilih.</p>
                    </div>
                  </>
                )}
              </form>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0 rounded-b-2xl">
              <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50">Batal</button>
              <button type="submit" form="mapping-form" disabled={isSubmitting || (tab === 'teacher_student' && form.student_ids.length === 0)} className="px-5 py-2.5 text-sm text-white bg-[#4CAF50] hover:bg-[#388E3C] rounded-xl flex items-center gap-2 disabled:opacity-50 shadow-sm hover:shadow-md transition-all">
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} 
                Simpan Pemetaan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MappingPage;
