import { Search, Plus } from 'lucide-react';

const TeacherListPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Data Guru</h2>
          <p className="text-sm text-gray-500">Kelola data tenaga pendidik.</p>
        </div>
        <button className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <Plus size={20} /> Tambah Guru
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Data Guru Belum Tersedia</h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Silakan tambahkan data guru baru atau impor dari file excel.
        </p>
      </div>
    </div>
  );
};

export default TeacherListPage;
