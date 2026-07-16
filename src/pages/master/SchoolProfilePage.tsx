import React, { useState, useEffect } from 'react';
import { Building2, Save, Loader2, Upload, MapPin, Mail, Phone, Hash, Clock, UserCheck } from 'lucide-react';
import axios from '../../lib/axios';

const SchoolProfilePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    npsn: '',
    email: '',
    phone: '',
    address: '',
    theme_color: '#4CAF50',
    principal_name: '',
    journal_start_time: '00:00',
    journal_end_time: '23:59',
  });
  
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/school-profile');
        if (response.data.success) {
          const { school, settings } = response.data.data;
          
          setFormData({
            name: school.name || '',
            npsn: school.npsn || '',
            email: school.email || '',
            phone: school.phone || '',
            address: school.address || '',
            theme_color: school.theme_color || '#4CAF50',
            principal_name: settings.principal_name || '',
            journal_start_time: settings.journal_start_time || '00:00',
            journal_end_time: settings.journal_end_time || '23:59',
          });

          if (school.logo) {
            setLogoPreview(`${import.meta.env.VITE_API_URL.replace('/api', '')}/storage/${school.logo}`);
          }
        }
      } catch (error) {
        console.error('Gagal mengambil profil sekolah', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      
      if (logoFile) {
        data.append('logo', logoFile);
      }

      const response = await axios.post('/school-profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        alert('Profil sekolah berhasil diperbarui!');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal memperbarui profil sekolah');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#4CAF50] animate-spin mb-4" />
        <p className="text-gray-500">Memuat profil sekolah...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-[#4CAF50]/10 rounded-xl">
          <Building2 className="w-6 h-6 text-[#2E7D32]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Profil & Pengaturan Sekolah</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola informasi sekolah dan operasional aplikasi.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Identitas Sekolah */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
            <Building2 className="text-[#4CAF50]" /> Identitas Sekolah
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Logo Sekolah</label>
              <div className="relative group cursor-pointer border-2 border-dashed border-gray-200 rounded-2xl aspect-square flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Sekolah" className="w-full h-full object-contain p-4" />
                ) : (
                  <div className="text-center p-4">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-500 font-medium">Upload Logo</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-medium text-sm">Ubah Logo</span>
                </div>
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            <div className="col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Sekolah <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Building2 className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30" placeholder="Contoh: SDIT Al-Fatih" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">NPSN</label>
                  <div className="relative">
                    <Hash className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" value={formData.npsn} onChange={(e) => setFormData({...formData, npsn: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30" placeholder="Nomor Pokok Sekolah Nasional" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Kepala Sekolah</label>
                  <div className="relative">
                    <UserCheck className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" value={formData.principal_name} onChange={(e) => setFormData({...formData, principal_name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30" placeholder="Nama Kepala Sekolah" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email Sekolah</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30" placeholder="info@sekolah.sch.id" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nomor Telepon</label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30" placeholder="021-123456" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Alamat Lengkap</label>
                <div className="relative">
                  <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                  <textarea rows={3} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 resize-none" placeholder="Alamat sekolah..." />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pengaturan Aplikasi */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
            <Clock className="text-blue-500" /> Operasional Jurnal
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Jam Buka Pengisian Jurnal</label>
              <input type="time" value={formData.journal_start_time} onChange={(e) => setFormData({...formData, journal_start_time: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              <p className="text-xs text-gray-500 mt-1">Siswa tidak dapat mengisi jurnal sebelum jam ini.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Batas Akhir (Tutup) Jurnal</label>
              <input type="time" value={formData.journal_end_time} onChange={(e) => setFormData({...formData, journal_end_time: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              <p className="text-xs text-gray-500 mt-1">Siswa tidak dapat mengisi jurnal hari tersebut setelah jam ini.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            disabled={isSaving}
            className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Simpan Perubahan
          </button>
        </div>

      </form>
    </div>
  );
};

export default SchoolProfilePage;
