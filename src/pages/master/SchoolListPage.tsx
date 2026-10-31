import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Building, X, Check, ShieldCheck, User, KeyRound, Copy } from 'lucide-react';
import axios from '../../lib/axios';

interface AdminUser {
  id: number;
  name: string;
  username: string;
  email: string | null;
}

interface School {
  id: number;
  name: string;
  npsn: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: string;
  admin?: AdminUser | null;
}

const SchoolListPage = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<School | null>(null);
  const [form, setForm] = useState({
    name: '',
    npsn: '',
    email: '',
    phone: '',
    address: '',
    admin_name: '',
    admin_username: '',
    admin_email: '',
    admin_password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Admin Modal state
  const [adminModalSchool, setAdminModalSchool] = useState<School | null>(null);
  const [adminForm, setAdminForm] = useState({ name: '', username: '', email: '', password: 'password' });
  const [adminSuccessMsg, setAdminSuccessMsg] = useState<{ username: string; password: string } | null>(null);
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/master/schools');
      if (res.data.success) {
        setSchools(res.data.data.data || res.data.data);
      }
    } catch {
      /* empty */
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAdd = () => {
    setEditingItem(null);
    setForm({
      name: '',
      npsn: '',
      email: '',
      phone: '',
      address: '',
      admin_name: '',
      admin_username: '',
      admin_email: '',
      admin_password: '',
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const openEdit = (s: School) => {
    setEditingItem(s);
    setForm({
      name: s.name,
      npsn: s.npsn || '',
      email: s.email || '',
      phone: s.phone || '',
      address: s.address || '',
      admin_name: '',
      admin_username: '',
      admin_email: '',
      admin_password: '',
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      if (editingItem) {
        await axios.put(`/master/schools/${editingItem.id}`, form);
      } else {
        await axios.post('/master/schools', form);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAdminModal = (s: School) => {
    setAdminModalSchool(s);
    setAdminForm({
      name: s.admin?.name || `Admin ${s.name}`,
      username: s.admin?.username || (s.npsn ? `admin_${s.npsn}` : `admin_${s.id}`),
      email: s.admin?.email || s.email || '',
      password: 'password',
    });
    setAdminSuccessMsg(null);
    setCopied(false);
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminModalSchool) return;
    setIsAdminSubmitting(true);
    setErrorMsg('');
    try {
      const res = await axios.post(`/master/schools/${adminModalSchool.id}/admin`, adminForm);
      if (res.data.success) {
        setAdminSuccessMsg({
          username: res.data.data.admin.username,
          password: res.data.data.default_password,
        });
        fetchData();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal mengelola akun admin');
    } finally {
      setIsAdminSubmitting(false);
    }
  };

  const copyCredentials = () => {
    if (!adminSuccessMsg) return;
    const text = `Akun Login Admin Sekolah:\nUsername / Email: ${adminSuccessMsg.username}\nPassword: ${adminSuccessMsg.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus sekolah ini? Seluruh data terkait juga akan terpengaruh.')) return;
    try {
      await axios.delete(`/master/schools/${id}`);
      fetchData();
    } catch {
      /* empty */
    }
  };

  const toggleStatus = async (id: number) => {
    try {
      await axios.patch(`/master/schools/${id}/status`);
      fetchData();
    } catch {
      /* empty */
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#4CAF50] animate-spin mb-4" />
        <p className="text-gray-500">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Daftar Sekolah</h2>
          <p className="text-sm text-gray-500">Kelola data institusi sekolah dan akun Admin Sekolah yang terdaftar.</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={20} /> Tambah Sekolah
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {schools.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Belum Ada Sekolah</h3>
          </div>
        ) : (
          schools.map((s) => (
            <div
              key={s.id}
              className={`bg-white rounded-xl shadow-sm border ${
                s.status === 'active' ? 'border-gray-100' : 'border-gray-200 bg-gray-50 opacity-75'
              } p-5 flex flex-col`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-bold text-xl">
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    s.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s.status === 'active' ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-1">{s.name}</h3>
              <p className="text-sm text-gray-500 mb-3">NPSN: {s.npsn || '—'}</p>

              {/* Detail Admin Sekolah */}
              <div className="p-3 bg-gray-50/80 rounded-xl mb-4 border border-gray-100 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                    <User size={14} className="text-gray-500" /> Akun Admin Sekolah:
                  </span>
                  {s.admin ? (
                    <button
                      type="button"
                      onClick={() => openAdminModal(s)}
                      className="text-[11px] text-[#2E7D32] hover:underline font-medium flex items-center gap-1"
                      title="Atur / Reset Password Admin"
                    >
                      <KeyRound size={12} /> Reset Akun
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openAdminModal(s)}
                      className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium hover:bg-amber-200 transition-colors"
                    >
                      + Buat Akun
                    </button>
                  )}
                </div>
                {s.admin ? (
                  <div className="space-y-0.5 text-gray-600">
                    <p className="font-medium text-gray-800">{s.admin.name}</p>
                    <p>
                      Username:{' '}
                      <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-800 font-mono text-[11px]">
                        {s.admin.username}
                      </code>
                    </p>
                    {s.admin.email && <p>Email: {s.admin.email}</p>}
                  </div>
                ) : (
                  <p className="text-amber-700 italic">Belum ada akun login Admin Sekolah.</p>
                )}
              </div>

              <div className="text-sm text-gray-600 space-y-1 mb-4 flex-1">
                <p>Email: {s.email || '—'}</p>
                <p>Telp: {s.phone || '—'}</p>
                <p className="truncate">Alamat: {s.address || '—'}</p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <button
                  onClick={() => toggleStatus(s.id)}
                  className={`text-sm font-medium ${s.status === 'active' ? 'text-amber-600' : 'text-green-600'}`}
                >
                  {s.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(s)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Tambah / Edit Sekolah */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-gray-800">{editingItem ? 'Edit' : 'Tambah'} Sekolah</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMsg}</p>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Sekolah *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30"
                  placeholder="Contoh: SMP Negeri 2 Pamekasan"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">NPSN</label>
                  <input
                    type="text"
                    value={form.npsn}
                    onChange={(e) => setForm({ ...form, npsn: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30"
                    placeholder="8 digit NPSN"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Telepon</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30"
                    placeholder="0324-..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Sekolah</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30"
                  placeholder="info@sekolah.sch.id"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30"
                  placeholder="Alamat lengkap sekolah"
                />
              </div>

              {/* Bagian Akun Admin Sekolah (Hanya saat Tambah Baru) */}
              {!editingItem && (
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <ShieldCheck size={18} className="text-[#4CAF50]" />
                    <span className="text-sm font-bold text-gray-800">Akun Admin Sekolah (Login)</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Akun ini otomatis dibuat agar Admin Sekolah dapat langsung login mengelola data kelas, guru, dan siswa.
                  </p>

                  <div className="space-y-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Username Admin</label>
                        <input
                          type="text"
                          placeholder={form.npsn ? `admin_${form.npsn}` : 'Otomatis jika kosong'}
                          value={form.admin_username}
                          onChange={(e) => setForm({ ...form, admin_username: e.target.value })}
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Password Admin</label>
                        <input
                          type="text"
                          placeholder="Default: password"
                          value={form.admin_password}
                          onChange={(e) => setForm({ ...form, admin_password: e.target.value })}
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-[#4CAF50] hover:bg-[#388E3C] rounded-xl flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Buat / Reset Akun Admin Sekolah */}
      {adminModalSchool && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#4CAF50]" />
                <h3 className="text-lg font-bold text-gray-800">
                  {adminModalSchool.admin ? 'Reset Akun' : 'Buat Akun'} Admin
                </h3>
              </div>
              <button onClick={() => setAdminModalSchool(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {adminSuccessMsg ? (
              <div className="p-6 space-y-4">
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-sm">
                  <p className="font-semibold mb-1">Akun Admin Berhasil Disimpan!</p>
                  <p className="text-xs text-green-700 mb-3">
                    Berikan informasi kredensial berikut kepada Admin Sekolah {adminModalSchool.name}:
                  </p>
                  <div className="bg-white p-3 rounded-lg border border-green-200 font-mono text-xs space-y-1 text-gray-800">
                    <p>
                      <strong>Username / Email:</strong> {adminSuccessMsg.username}
                    </p>
                    <p>
                      <strong>Password:</strong> {adminSuccessMsg.password}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={copyCredentials}
                    className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center gap-2"
                  >
                    <Copy size={16} /> {copied ? 'Tersalin!' : 'Salin Kredensial'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminModalSchool(null)}
                    className="flex-1 py-2.5 text-sm font-medium text-white bg-[#4CAF50] hover:bg-[#388E3C] rounded-xl"
                  >
                    Selesai
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAdminSubmit} className="p-6 space-y-4">
                <p className="text-xs text-gray-500">
                  Atur kredensial akun login Admin Sekolah untuk <strong>{adminModalSchool.name}</strong>.
                </p>

                {errorMsg && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMsg}</p>}

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nama Admin</label>
                  <input
                    type="text"
                    required
                    value={adminForm.name}
                    onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Username Login *</label>
                  <input
                    type="text"
                    required
                    value={adminForm.username}
                    onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email Login</label>
                  <input
                    type="email"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Password Baru *</label>
                  <input
                    type="text"
                    required
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30"
                    placeholder="Minimal 6 karakter"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAdminModalSchool(null)}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isAdminSubmitting}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-[#4CAF50] hover:bg-[#388E3C] rounded-xl flex items-center gap-2 disabled:opacity-50"
                  >
                    {isAdminSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Simpan Akun
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolListPage;
