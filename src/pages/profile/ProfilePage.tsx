import { useState, useEffect } from 'react';
import { UserCircle, Loader2, Save, Lock, Check } from 'lucide-react';
import axios from '../../lib/axios';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '' });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isPwSaving, setIsPwSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [pwErrMsg, setPwErrMsg] = useState('');

  useEffect(() => { if (user) setForm({ name: user.name, email: user.email || '' }); }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true); setMsg(''); setErrMsg('');
    try {
      const res = await axios.put('/profile', form);
      if (res.data.success) { setMsg('Profil berhasil diperbarui'); if (setUser) setUser(res.data.data); }
    } catch (err: any) { setErrMsg(err.response?.data?.message || 'Gagal'); } finally { setIsSaving(false); }
  };

  const handlePwSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsPwSaving(true); setPwMsg(''); setPwErrMsg('');
    try {
      await axios.put('/change-password', pwForm);
      setPwMsg('Password berhasil diubah');
      setPwForm({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      setPwErrMsg(errors?.current_password?.[0] || err.response?.data?.message || 'Gagal');
    } finally { setIsPwSaving(false); }
  };

  if (!user) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 text-[#4CAF50] animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
            <UserCircle className="w-12 h-12 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-green-100 capitalize">{user.role}</p>
            <p className="text-green-200 text-sm">{user.email}</p>
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
      </div>

      {/* Edit Profile */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Save size={20} className="text-[#4CAF50]" /> Ubah Profil</h3>
        {msg && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2"><Check size={16} /> {msg}</div>}
        {errMsg && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">{errMsg}</div>}
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Nama</label><input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label><input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" /></div>
          <div className="flex justify-end"><button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-[#4CAF50] hover:bg-[#388E3C] text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 transition-colors">{isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan</button></div>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Lock size={20} className="text-[#4CAF50]" /> Ganti Password</h3>
        {pwMsg && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2"><Check size={16} /> {pwMsg}</div>}
        {pwErrMsg && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">{pwErrMsg}</div>}
        <form onSubmit={handlePwSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Password Saat Ini</label><input type="password" required value={pwForm.current_password} onChange={e => setPwForm({...pwForm, current_password: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Password Baru</label><input type="password" required minLength={6} value={pwForm.new_password} onChange={e => setPwForm({...pwForm, new_password: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Password Baru</label><input type="password" required value={pwForm.new_password_confirmation} onChange={e => setPwForm({...pwForm, new_password_confirmation: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:border-[#4CAF50]" /></div>
          <div className="flex justify-end"><button type="submit" disabled={isPwSaving} className="px-6 py-2.5 bg-[#4CAF50] hover:bg-[#388E3C] text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 transition-colors">{isPwSaving ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />} Ganti Password</button></div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
