import { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, X } from 'lucide-react';

// Mock data
const mockStudents = [
  { id: 1, nis: '100101', name: 'Ahmad Faisal', class: '10-A', status: 'Active' },
  { id: 2, nis: '100102', name: 'Budi Santoso', class: '10-A', status: 'Active' },
  { id: 3, nis: '100103', name: 'Siti Aminah', class: '10-B', status: 'Active' },
  { id: 4, nis: '100104', name: 'Dewi Lestari', class: '11-A', status: 'Inactive' },
  { id: 5, nis: '100105', name: 'Eko Prasetyo', class: '12-A', status: 'Active' },
];

const StudentListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = mockStudents.filter(s => 
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
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} /> Tambah Siswa
        </button>
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
        <button className="flex items-center gap-2 text-gray-600 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter size={20} /> Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="px-6 py-4 font-medium">NIS</th>
                <th className="px-6 py-4 font-medium">Nama Siswa</th>
                <th className="px-6 py-4 font-medium">Kelas</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.nis}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{student.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium border border-gray-200">
                      {student.class}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      student.status === 'Active' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Data siswa tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>Menampilkan {filteredStudents.length} dari {mockStudents.length} data</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 bg-[#4CAF50] text-white rounded">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Tambah Data Siswa</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nomor Induk Siswa (NIS)</label>
                <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20 focus:border-[#4CAF50]" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20 focus:border-[#4CAF50]" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Kelas</label>
                <select className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20 focus:border-[#4CAF50] bg-white">
                  <option value="10-A">10-A</option>
                  <option value="10-B">10-B</option>
                  <option value="11-A">11-A</option>
                </select>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-[#4CAF50] hover:bg-[#388E3C] text-white rounded-lg font-medium transition-colors">
                  Simpan Data
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
