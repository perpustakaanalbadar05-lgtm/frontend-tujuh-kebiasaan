import React, { useState, useEffect } from 'react';
import { Settings, Calendar, Users, ListChecks, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import axios from '../../lib/axios';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<'academic_years' | 'classes' | 'habits'>('academic_years');
  
  // States
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form States (Simple implementation)
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ayRes, classRes, habitRes] = await Promise.all([
        axios.get('/master/academic-years'),
        axios.get('/master/classes'), // Ini akan butuh API resource, kita asumsikan sudah ada
        axios.get('/master/habits')
      ]);
      setAcademicYears(ayRes.data.data);
      setClasses(classRes.data.data);
      setHabits(habitRes.data.data);
    } catch (error) {
      console.error('Gagal mengambil data master', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openForm = (data: any = null) => {
    setEditingId(data ? data.id : null);
    if (data) {
      setFormData(data);
    } else {
      if (activeTab === 'academic_years') setFormData({ name: '', start_date: '', end_date: '', active: false });
      if (activeTab === 'classes') setFormData({ grade: '', name: '', academic_year_id: academicYears[0]?.id || '' });
      if (activeTab === 'habits') setFormData({ name: '', order_number: habits.length + 1, active: true });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let endpoint = `/master/${activeTab.replace('_', '-')}`; // academic-years, classes, habits
      if (activeTab === 'academic_years') endpoint = '/master/academic-years';
      
      if (editingId) {
        await axios.put(`${endpoint}/${editingId}`, formData);
      } else {
        await axios.post(endpoint, formData);
      }
      await fetchData();
      closeForm();
    } catch (error) {
      console.error('Gagal menyimpan', error);
      alert('Gagal menyimpan data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    setIsLoading(true);
    try {
      let endpoint = `/master/${activeTab.replace('_', '-')}`;
      if (activeTab === 'academic_years') endpoint = '/master/academic-years';
      
      await axios.delete(`${endpoint}/${id}`);
      await fetchData();
    } catch (error: any) {
      console.error('Gagal menghapus', error);
      alert(error.response?.data?.message || 'Gagal menghapus data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-[#4CAF50]/10 rounded-xl">
          <Settings className="w-6 h-6 text-[#2E7D32]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Konfigurasi Sistem</h1>
          <p className="text-gray-500 text-sm">Kelola Tahun Ajaran, Kelas, dan Pengaturan Habit.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <button
          onClick={() => setActiveTab('academic_years')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${activeTab === 'academic_years' ? 'bg-[#4CAF50] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <Calendar className="w-4 h-4" /> Tahun Ajaran
        </button>
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${activeTab === 'classes' ? 'bg-[#4CAF50] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <Users className="w-4 h-4" /> Daftar Kelas
        </button>
        <button
          onClick={() => setActiveTab('habits')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${activeTab === 'habits' ? 'bg-[#4CAF50] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <ListChecks className="w-4 h-4" /> Pengaturan 7 Kebiasaan
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800">
            {activeTab === 'academic_years' ? 'Manajemen Tahun Ajaran' : activeTab === 'classes' ? 'Manajemen Kelas' : 'Redaksi 7 Kebiasaan'}
          </h2>
          <button 
            onClick={() => openForm()}
            className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Baru
          </button>
        </div>

        {isLoading && !showForm ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#4CAF50]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Table Academic Years */}
            {activeTab === 'academic_years' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-sm text-gray-600 border-b border-gray-100">
                    <th className="p-4 font-semibold">Tahun Ajaran</th>
                    <th className="p-4 font-semibold">Mulai</th>
                    <th className="p-4 font-semibold">Berakhir</th>
                    <th className="p-4 font-semibold text-center">Status</th>
                    <th className="p-4 font-semibold text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {academicYears.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="p-4 font-medium text-gray-800">{item.name}</td>
                      <td className="p-4 text-gray-600">{item.start_date}</td>
                      <td className="p-4 text-gray-600">{item.end_date}</td>
                      <td className="p-4 text-center">
                        {item.active ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Aktif</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">Nonaktif</span>
                        )}
                      </td>
                      <td className="p-4 flex justify-center gap-2">
                        <button onClick={() => openForm(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Table Classes */}
            {activeTab === 'classes' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-sm text-gray-600 border-b border-gray-100">
                    <th className="p-4 font-semibold">Tingkat (Grade)</th>
                    <th className="p-4 font-semibold">Nama Kelas</th>
                    <th className="p-4 font-semibold">Tahun Ajaran</th>
                    <th className="p-4 font-semibold text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {classes.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="p-4 font-medium text-gray-800">Kelas {item.grade}</td>
                      <td className="p-4 text-gray-800">{item.name}</td>
                      <td className="p-4 text-gray-500">{item.academic_year?.name || '-'}</td>
                      <td className="p-4 flex justify-center gap-2">
                        <button onClick={() => openForm(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Table Habits */}
            {activeTab === 'habits' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-sm text-gray-600 border-b border-gray-100">
                    <th className="p-4 font-semibold w-16 text-center">Urutan</th>
                    <th className="p-4 font-semibold">Nama Kebiasaan</th>
                    <th className="p-4 font-semibold text-center">Status</th>
                    <th className="p-4 font-semibold text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {habits.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="p-4 text-center font-bold text-gray-500">#{item.order_number}</td>
                      <td className="p-4 font-medium text-gray-800">{item.name}</td>
                      <td className="p-4 text-center">
                        {item.active ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Aktif</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">Nonaktif</span>
                        )}
                      </td>
                      <td className="p-4 flex justify-center gap-2">
                        <button onClick={() => openForm(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Data' : 'Tambah Baru'}</h3>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              
              {activeTab === 'academic_years' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama (Cth: 2024/2025)</label>
                    <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg p-2.5 focus:ring-2 outline-none"/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mulai</label>
                      <input required type="date" value={formData.start_date || ''} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full border rounded-lg p-2.5 focus:ring-2 outline-none"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Berakhir</label>
                      <input required type="date" value={formData.end_date || ''} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full border rounded-lg p-2.5 focus:ring-2 outline-none"/>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" id="active_ay" checked={formData.active || false} onChange={e => setFormData({...formData, active: e.target.checked})} className="w-4 h-4 text-[#4CAF50] rounded border-gray-300 focus:ring-[#4CAF50]"/>
                    <label htmlFor="active_ay" className="text-sm font-medium text-gray-700">Set sebagai Tahun Ajaran Aktif</label>
                  </div>
                </>
              )}

              {activeTab === 'classes' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran</label>
                    <select required value={formData.academic_year_id || ''} onChange={e => setFormData({...formData, academic_year_id: e.target.value})} className="w-full border rounded-lg p-2.5 focus:ring-2 outline-none">
                      <option value="">Pilih Tahun Ajaran...</option>
                      {academicYears.map(ay => (
                        <option key={ay.id} value={ay.id}>{ay.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat (Grade)</label>
                      <input required type="text" placeholder="Cth: 10" value={formData.grade || ''} onChange={e => setFormData({...formData, grade: e.target.value})} className="w-full border rounded-lg p-2.5 focus:ring-2 outline-none"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kelas</label>
                      <input required type="text" placeholder="Cth: X MIPA 1" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg p-2.5 focus:ring-2 outline-none"/>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'habits' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Redaksi Kebiasaan</label>
                    <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg p-2.5 focus:ring-2 outline-none"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Urut</label>
                    <input required type="number" min="1" value={formData.order_number || ''} onChange={e => setFormData({...formData, order_number: e.target.value})} className="w-full border rounded-lg p-2.5 focus:ring-2 outline-none"/>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" id="active_hb" checked={formData.active !== false} onChange={e => setFormData({...formData, active: e.target.checked})} className="w-4 h-4 text-[#4CAF50] rounded border-gray-300 focus:ring-[#4CAF50]"/>
                    <label htmlFor="active_hb" className="text-sm font-medium text-gray-700">Tampilkan di Form Siswa</label>
                  </div>
                </>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={closeForm} className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100">Batal</button>
                <button type="submit" disabled={isLoading} className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SettingsPage;
