import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, Loader2, Users, X, Check, UploadCloud, Download, KeyRound } from 'lucide-react';
import axios from '../../lib/axios';

interface Teacher {
  id: number;
  name: string;
  nip: string | null;
  email: string | null;
  phone: string | null;
  user?: { id: number; name: string };
}

interface PaginatedResponse {
  data: Teacher[];
  current_page: number;
  last_page: number;
  total: number;
}

const TeacherListPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [form, setForm] = useState({ name: '', nip: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchTeachers = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (search) params.search = search;
      const res = await axios.get('/master/teachers', { params });
      if (res.data.success) {
        const d = res.data.data as PaginatedResponse;
        setTeachers(d.data);
        setPagination({ current_page: d.current_page, last_page: d.last_page, total: d.total });
      }
    } catch { /* empty */ } finally { setIsLoading(false); }
  }, [search]);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  const openAdd = () => {
    setEditingTeacher(null);
    setForm({ name: '', nip: '', email: '', phone: '' });
    setErrorMsg('');
    setShowModal(true);
  };

  const openEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setForm({ name: t.name, nip: t.nip || '', email: t.email || '', phone: t.phone || '' });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      if (editingTeacher) {
        await axios.put(`/master/teachers/${editingTeacher.id}`, form);
      } else {
        await axios.post('/master/teachers', form);
      }
      setShowModal(false);
      fetchTeachers(pagination.current_page);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Terjadi kesalahan');
    } finally { setIsSubmitting(false); }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) {
      setErrorMsg('Pilih file Excel terlebih dahulu.');
      return;
    }
    
    setIsImporting(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', importFile);
      
      const response = await axios.post('/import/teachers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        setIsImportModalOpen(false);
        setImportFile(null);
        alert('Data guru berhasil diimport!');
        fetchTeachers();
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Gagal melakukan import data.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get('/master/teachers/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'data_guru.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Gagal mengekspor data');
    }
  };

  const handleResetPassword = async (id: number, name: string) => {
    if (window.confirm(`Yakin ingin mereset sandi guru ${name}? Sandi akan direset menjadi NIP atau 'password'.`)) {
      try {
        const response = await axios.patch(`/master/teachers/${id}/reset-password`);
        if (response.data.success) {
          alert('Sandi berhasil direset!');
        }
      } catch (error) {
        alert('Gagal mereset sandi.');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus data guru ini?')) return;
    try {
      await axios.delete(`/master/teachers/${id}`);
      fetchTeachers(pagination.current_page);
    } catch { /* empty */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Data Guru</h2>
          <p className="text-sm text-gray-500">Kelola data tenaga pendidik. Total: {pagination.total}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleExport}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
          >
            <Download size={20} /> Export Excel
          </button>
          <button 
            onClick={() => { setErrorMsg(''); setImportFile(null); setIsImportModalOpen(true); }}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
          >
            <UploadCloud size={20} /> Import Excel
          </button>
          <button onClick={openAdd} className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md">
            <Plus size={20} /> Tambah Guru
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, NIP, atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <Loader2 className="w-10 h-10 text-[#4CAF50] animate-spin mb-4" />
          <p className="text-gray-500">Memuat data guru...</p>
        </div>
      ) : teachers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Data Guru Belum Tersedia</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">Silakan tambahkan data guru baru atau impor dari file excel.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">NIP</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Telepon</th>
                  <th className="text-center px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{t.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.nip || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{t.email || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{t.phone || '—'}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => handleResetPassword(t.id, t.name)} 
                          className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors" 
                          title="Reset Password"
                        >
                          <KeyRound size={16} />
                        </button>
                        <button onClick={() => openEdit(t)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">Halaman {pagination.current_page} dari {pagination.last_page}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchTeachers(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >Sebelumnya</button>
                <button
                  onClick={() => fetchTeachers(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >Selanjutnya</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">{editingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMsg}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap *</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">NIP</label>
                <input type="text" value={form.nip} onChange={e => setForm({...form, nip: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] transition-colors" placeholder="Opsional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] transition-colors" placeholder="Opsional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Telepon</label>
                <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50] transition-colors" placeholder="Opsional" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium text-white bg-[#4CAF50] hover:bg-[#388E3C] rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {editingTeacher ? 'Perbarui' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isImporting && setIsImportModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Import Data Guru</h3>
              <button 
                onClick={() => !isImporting && setIsImportModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form className="p-6 space-y-4" onSubmit={handleImportSubmit}>
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {errorMsg}
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-100 text-blue-700 p-4 rounded-xl text-sm leading-relaxed mb-4">
                <p className="font-bold mb-1">Panduan Import:</p>
                <ul className="list-disc pl-5 space-y-1 mb-3">
                  <li>Pastikan file berformat <b>.xlsx</b> atau <b>.csv</b>.</li>
                  <li>Header kolom (baris 1) wajib mengikuti format template.</li>
                  <li>Sistem akan otomatis membuatkan akun user dengan password default sama dengan NIP.</li>
                </ul>
                <button 
                  type="button" 
                  onClick={async () => {
                    try {
                      const response = await axios.get('/master/teachers/template', { responseType: 'blob' });
                      const url = window.URL.createObjectURL(new Blob([response.data]));
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', 'template_data_guru.xlsx');
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                    } catch (error) {
                      alert('Gagal mengunduh template');
                    }
                  }}
                  className="bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-sm text-xs"
                >
                  <Download size={14} /> Unduh Template Excel
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">File Excel</label>
                <input 
                  type="file" 
                  accept=".xlsx, .csv, .xls"
                  onChange={(e) => setImportFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20 focus:border-[#4CAF50]" 
                  required 
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => !isImporting && setIsImportModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={isImporting || !importFile} className="px-4 py-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50">
                  {isImporting ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengimport...</> : 'Mulai Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherListPage;
