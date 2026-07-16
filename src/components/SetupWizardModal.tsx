import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Calendar as CalendarIcon, ArrowRight, X, Info } from 'lucide-react';
import axios from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';

const SetupWizardModal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only show to Admin/SuperAdmin
    if (user?.role !== 'admin' && user?.role !== 'superadmin') {
      setIsLoading(false);
      return;
    }

    // Check if school has an academic year
    const checkSetupStatus = async () => {
      try {
        const response = await axios.get('/master/academic-years');
        if (response.data.success) {
          const academicYears = response.data.data.data || response.data.data;
          if (academicYears.length === 0) {
            // No academic year exists, prompt the wizard
            setIsOpen(true);
          }
        }
      } catch (error) {
        console.error('Failed to check academic years status', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSetupStatus();
  }, [user]);

  if (isLoading || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] p-8 text-white relative">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <h2 className="text-3xl font-black mb-2">Selamat Datang di G7KAIH!</h2>
          <p className="text-green-50 text-lg opacity-90">
            Mari persiapkan aplikasi agar siap digunakan oleh guru dan siswa.
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="flex items-center gap-4 p-5 bg-blue-50 border border-blue-100 rounded-2xl">
                <Info className="text-blue-500 w-8 h-8 shrink-0" />
                <p className="text-blue-800 text-sm leading-relaxed">
                  Sistem mendeteksi bahwa sekolah Anda belum memiliki <b>Tahun Ajaran Aktif</b>. Anda harus melengkapi konfigurasi awal sebelum fitur transaksi (Jurnal Harian) dapat beroperasi.
                </p>
              </div>

              <div className="space-y-4 mt-6">
                <h3 className="text-xl font-bold text-gray-800">Langkah 1: Profil Sekolah</h3>
                <p className="text-gray-500">
                  Pastikan nama sekolah, logo, dan pengaturan jam operasional jurnal sudah sesuai. Ini akan tampil di raport dan antarmuka siswa.
                </p>
                <button 
                  onClick={() => { setIsOpen(false); navigate('/dashboard/school-profile'); }}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-[#4CAF50] rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-lg shadow-sm text-gray-400 group-hover:text-[#4CAF50]">
                      <Building2 size={24} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-gray-800">Lengkapi Profil Sekolah</h4>
                      <p className="text-sm text-gray-500">Atur Identitas & Logo</p>
                    </div>
                  </div>
                  <ArrowRight className="text-gray-400 group-hover:text-[#4CAF50]" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800">Langkah 2: Tahun Ajaran & Kelas</h3>
                <p className="text-gray-500">
                  Data utama yang wajib ada adalah Tahun Ajaran aktif dan Semester berjalan. Setelah itu, buat Kelas agar siswa bisa didaftarkan.
                </p>
                <button 
                  onClick={() => { setIsOpen(false); navigate('/dashboard/academic-years'); }}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-[#4CAF50] rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-lg shadow-sm text-gray-400 group-hover:text-[#4CAF50]">
                      <CalendarIcon size={24} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-gray-800">Buat Tahun Ajaran</h4>
                      <p className="text-sm text-gray-500">Konfigurasi Master Data Dasar</p>
                    </div>
                  </div>
                  <ArrowRight className="text-gray-400 group-hover:text-[#4CAF50]" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="flex gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${step === 1 ? 'bg-[#4CAF50]' : 'bg-gray-300'}`}></span>
            <span className={`w-2.5 h-2.5 rounded-full ${step === 2 ? 'bg-[#4CAF50]' : 'bg-gray-300'}`}></span>
          </div>
          
          <div className="flex gap-3">
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors"
              >
                Kembali
              </button>
            )}
            {step < 2 ? (
              <button 
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 bg-[#4CAF50] text-white font-medium hover:bg-[#388E3C] rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                Selanjutnya <ArrowRight size={18} />
              </button>
            ) : (
              <button 
                onClick={() => setIsOpen(false)}
                className="px-6 py-2.5 bg-gray-800 text-white font-medium hover:bg-gray-900 rounded-xl shadow-md transition-all"
              >
                Tutup Panduan
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SetupWizardModal;
