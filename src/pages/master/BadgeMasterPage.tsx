import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Medal, Loader2, Save, X, Globe, Building2 } from 'lucide-react';
import axios from '../../lib/axios';
import { useAuth } from '../../contexts/AuthContext';

interface Badge {
  id: number;
  school_id: number | null;
  name: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number | null;
  is_active: boolean;
}

const BadgeMasterPage = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🏆',
    condition_type: 'manual',
    condition_value: '',
    is_global: false,
    is_active: true
  });

  const fetchBadges = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/master/badges');
      if (response.data.success) {
        setBadges(response.data.data);
      }
    } catch (error) {
      console.error('Gagal mengambil data badge', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const handleOpenModal = (badge?: Badge) => {
    if (badge) {
      setEditingBadge(badge);
      setFormData({
        name: badge.name,
        description: badge.description || '',
        icon: badge.icon || '🏆',
        condition_type: badge.condition_type,
        condition_value: badge.condition_value?.toString() || '',
        is_global: badge.school_id === null,
        is_active: badge.is_active
      });
    } else {
      setEditingBadge(null);
      setFormData({
        name: '',
        description: '',
        icon: '🏆',
        condition_type: 'manual',
        condition_value: '',
        is_global: false,
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        condition_value: formData.condition_value ? parseInt(formData.condition_value) : null
      };

      if (editingBadge) {
        await axios.put(`/master/badges/${editingBadge.id}`, payload);
      } else {
        await axios.post('/master/badges', payload);
      }
      
      setIsModalOpen(false);
      fetchBadges();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus badge ini?')) {
      try {
        await axios.delete(`/master/badges/${id}`);
        fetchBadges();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Gagal menghapus');
      }
    }
  };

  const filteredBadges = badges.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (b.description && b.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Medal className="text-[#4CAF50] w-7 h-7" /> Master Badge
          </h1>
          <p className="text-gray-500 text-sm mt-1">Kelola lencana dan penghargaan (Gamifikasi) untuk siswa.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-[#4CAF50]/20 focus-within:border-[#4CAF50] transition-all">
            <Search className="text-gray-400 w-5 h-5 mr-2" />
            <input 
              type="text" 
              placeholder="Cari badge..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="outline-none text-sm w-full bg-transparent"
            />
          </div>
          {(user?.role === 'superadmin' || user?.role === 'admin') && (
            <button 
              onClick={() => handleOpenModal()}
              className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Tambah Badge</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Badges */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-[#4CAF50] animate-spin" />
        </div>
      ) : filteredBadges.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Medal className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-gray-900 font-bold text-lg">Belum ada Badge</h3>
          <p className="text-gray-500 mt-1">Tambahkan badge baru untuk memulai gamifikasi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBadges.map(badge => (
            <div key={badge.id} className={`bg-white rounded-2xl p-6 border transition-all hover:shadow-md ${!badge.is_active ? 'border-gray-200 bg-gray-50 opacity-75' : 'border-[#4CAF50]/20'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-green-200/50">
                  {badge.icon}
                </div>
                {(user?.role === 'superadmin' || badge.school_id === user?.school_id) && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleOpenModal(badge)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(badge.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-1">{badge.name}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">{badge.description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-gray-100 text-gray-600">
                  {badge.school_id === null ? (
                    <><Globe className="w-3.5 h-3.5" /> Global</>
                  ) : (
                    <><Building2 className="w-3.5 h-3.5" /> Sekolah</>
                  )}
                </div>
                
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                  badge.condition_type === 'manual' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {badge.condition_type === 'manual' ? 'Pemberian Manual' : 'Otomatis'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">{editingBadge ? 'Edit Badge' : 'Tambah Badge'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Badge <span className="text-red-500">*</span></label>
                <input 
                  type="text" required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30"
                  placeholder="Contoh: Konsisten 7 Hari"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Emoji Icon <span className="text-red-500">*</span></label>
                <input 
                  type="text" required
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  className="w-20 bg-gray-50 border border-gray-200 text-gray-800 text-center text-2xl rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 min-h-[80px]"
                  placeholder="Keterangan cara mendapatkan badge ini..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tipe Kondisi</label>
                <select 
                  value={formData.condition_type}
                  onChange={(e) => setFormData({...formData, condition_type: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30"
                >
                  <option value="manual">Pemberian Manual oleh Guru/Admin</option>
                  <option value="consistent_days">Otomatis: Jurnal Konsisten (X Hari)</option>
                  <option value="perfect_score">Otomatis: Skor Sempurna</option>
                </select>
              </div>

              {formData.condition_type === 'consistent_days' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Jumlah Hari (X) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" required min="1"
                    value={formData.condition_value}
                    onChange={(e) => setFormData({...formData, condition_value: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30"
                    placeholder="Contoh: 7"
                  />
                </div>
              )}

              {user?.role === 'superadmin' && (
                <div className="flex items-center gap-2 mt-2">
                  <input 
                    type="checkbox" 
                    id="is_global"
                    checked={formData.is_global}
                    onChange={(e) => setFormData({...formData, is_global: e.target.checked})}
                    className="w-4 h-4 text-[#4CAF50] rounded border-gray-300 focus:ring-[#4CAF50]"
                  />
                  <label htmlFor="is_global" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Badge Global (Berlaku untuk semua sekolah)
                  </label>
                </div>
              )}

              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4 text-[#4CAF50] rounded border-gray-300 focus:ring-[#4CAF50]"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Badge Aktif (Bisa didapatkan siswa)
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-6 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BadgeMasterPage;
