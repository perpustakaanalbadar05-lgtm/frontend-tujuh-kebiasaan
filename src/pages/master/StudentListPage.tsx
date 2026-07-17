import { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, X, Loader2, UploadCloud, Download, KeyRound } from 'lucide-react';
import axios from '../../lib/axios';

interface Student {
  id: number;
  nis: string;
  name: string;
  gender: string;
  status: string;
  school_class?: {
    id: number;
    name: string;
  };
}

const StudentListPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    nis: '',
    name: '',
    gender: 'L',
    class_id: 1 // Default to 1 for demo purposes
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/master/students');
      if (response.data.success) {
        setStudents(response.data.data.data || response.data.data); // Handle pagination structure
      }
    } catch (error) {
      console.error('Failed to fetch students', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      const response = await axios.post('/master/students', formData);
      if (response.data.success) {
        setIsModalOpen(false);
        setFormData({ nis: '', name: '', gender: 'L', class_id: 1 });
        fetchStudents(); // Refresh data
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setFormError(error.response.data.message);
      } else {
        setFormError('Terjadi kesalahan pada server saat menyimpan data.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) {
      setFormError('Pilih file Excel terlebih dahulu.');
      return;
    }
    
    setIsImporting(true);
    setFormError('');

    try {
      const formData = new FormData();
      formData.append('file', importFile);
      
      const response = await axios.post('/import/students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        setIsImportModalOpen(false);
        setImportFile(null);
        alert('Data siswa berhasil diimport!');
        fetchStudents();
      }
    } catch (error: any) {
      setFormError(error.response?.data?.message || 'Gagal melakukan import data.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get('/master/students/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'data_siswa.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Gagal mengekspor data');
    }
  };

  const handleResetPassword = async (id: number, name: string) => {
    if (window.confirm(`Yakin ingin mereset sandi siswa ${name} menjadi NIS-nya?`)) {
      try {
        const response = await axios.patch(`/master/students/${id}/reset-password`);
        if (response.data.success) {
          alert('Sandi berhasil direset!');
        }
      } catch (error) {
        alert('Gagal mereset sandi.');
      }
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.nis.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Data Siswa</h2>
          <p className="text-sm text-gray-500">Kelola data siswa yang terdaftar di sistem.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleExport}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Download size={20} /> Export Excel
          </button>
          <button 
            onClick={() => { setFormError(''); setImportFile(null); setIsImportModalOpen(true); }}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <UploadCloud size={20} /> Import Excel
          </button>
          <button 
            onClick={() => { setFormError(''); setIsModalOpen(true); }}
            className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={20} /> Tambah Siswa
          </button>
        </div>
      </div>

      {/* Toolbar (Search & Filter) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari NIS atau Nama..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20 focus:border-[#4CAF50]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="px-6 py-4 font-medium">NIS</th>
                <th className="px-6 py-4 font-medium">Nama Siswa</th>
                <th className="px-6 py-4 font-medium">L/P</th>
                <th className="px-6 py-4 font-medium">Kelas</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin text-[#4CAF50] mx-auto mb-2" />
                    Memuat data...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Data siswa tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.nis}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.gender}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium border border-gray-200">
                        {student.school_class?.name || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleResetPassword(student.id, student.name)}
                          title="Reset Password ke NIS"
                          className="p-1.5 text-orange-500 hover:text-white rounded-md hover:bg-orange-500 transition-colors"
                        >
                          <KeyRound size={18} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
                          <MoreVertical size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Tambah Data Siswa</h3>
              <button 
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {formError}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nomor Induk Siswa (NIS)</label>
                <input 
                  type="text" 
                  value={formData.nis}
                  onChange={(e) => setFormData({...formData, nis: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20 focus:border-[#4CAF50]" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20 focus:border-[#4CAF50]" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Kelas</label>
                  <select 
                    value={formData.class_id}
                    onChange={(e) => setFormData({...formData, class_id: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20 focus:border-[#4CAF50] bg-white"
                  >
                    <option value={1}>Kelas 10-A (Dummy)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Jenis Kelamin</label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20 focus:border-[#4CAF50] bg-white"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => !isSubmitting && setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
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
              <h3 className="text-xl font-bold text-gray-800">Import Data Siswa</h3>
              <button 
                onClick={() => !isImporting && setIsImportModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form className="p-6 space-y-4" onSubmit={handleImportSubmit}>
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {formError}
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-100 text-blue-700 p-4 rounded-xl text-sm leading-relaxed mb-4">
                <p className="font-bold mb-1">Panduan Import:</p>
                <ul className="list-disc pl-5 space-y-1 mb-3">
                  <li>Pastikan file berformat <b>.xlsx</b> atau <b>.csv</b>.</li>
                  <li>Header kolom (baris 1) wajib mengikuti format template.</li>
                  <li>Sistem otomatis membuatkan akun dengan password NIP/NIS.</li>
                </ul>
                <button 
                  type="button" 
                  onClick={async () => {
                    try {
                      const response = await axios.get('/master/students/template', { responseType: 'blob' });
                      const url = window.URL.createObjectURL(new Blob([response.data]));
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', 'template_data_siswa.xlsx');
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

export default StudentListPage;
