import { Outlet, NavLink } from 'react-router-dom';
import { Menu, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      {/* Top Header */}
      <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-md lg:hidden">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-[#2E7D32]">G7KAIH Management</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
            <UserCircle className="w-8 h-8 text-[#4CAF50]" />
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-800 capitalize">{user?.name || 'Loading...'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'Guest'}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Sidebar (Desktop) */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-100 text-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Navigasi Utama</p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <NavLink 
              to="/dashboard" end
              className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive ? 'bg-[#4CAF50]/10 text-[#2E7D32]' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="w-5 h-5">📊</div>
              Dashboard
            </NavLink>
            {user?.role === 'siswa' && (
              <NavLink 
                to="/dashboard/journal"
                className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive ? 'bg-[#4CAF50]/10 text-[#2E7D32]' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <div className="w-5 h-5">📝</div>
                Jurnal Harian
              </NavLink>
            )}
            {(user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'guru' || user?.role === 'orangtua') && (
              <NavLink 
                to="/dashboard/approvals"
                className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive ? 'bg-[#4CAF50]/10 text-[#2E7D32]' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <div className="w-5 h-5">✅</div>
                Validasi Jurnal
              </NavLink>
            )}
            <NavLink 
              to="/dashboard/reports"
              className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive ? 'bg-[#4CAF50]/10 text-[#2E7D32]' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="w-5 h-5">📄</div>
              Laporan Bulanan
            </NavLink>
            {(user?.role === 'admin' || user?.role === 'superadmin') && (
              <>
                <NavLink 
                  to="/dashboard/students"
                  className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive ? 'bg-[#4CAF50]/10 text-[#2E7D32]' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <div className="w-5 h-5">🎓</div>
                  Data Siswa
                </NavLink>
                <NavLink 
                  to="/dashboard/teachers"
                  className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive ? 'bg-[#4CAF50]/10 text-[#2E7D32]' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <div className="w-5 h-5">👨‍🏫</div>
                  Data Guru
                </NavLink>
              </>
            )}
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
              Transaksi
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
              Laporan
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
              Pengaturan
            </a>
          </nav>
        </aside>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
