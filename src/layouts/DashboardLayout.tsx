import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Menu, UserCircle, LogOut, ChevronDown, ChevronRight, X, Megaphone, BarChart3, Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../lib/axios';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({ master: false });
  const [activeModules, setActiveModules] = useState<string[]>(['timeline', 'badge', 'evaluasi', 'kalender']);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await axios.get('/school-profile');
        if (response.data.success) {
          const mods = response.data.data.settings.active_modules;
          if (mods) setActiveModules(JSON.parse(mods));
        }
      } catch (err) {
        // ignore
      }
    };
    if (user?.school_id) {
        fetchModules();
    }
  }, [user]);

  const hasModule = (mod: string) => activeModules.includes(mod);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const toggleMenu = (menu: string) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
    <NavLink 
      to={to} 
      end={to === '/dashboard'}
      className={({isActive}) => `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${isActive ? 'bg-[#4CAF50] text-white shadow-md shadow-green-500/20' : 'text-gray-600 hover:bg-green-50 hover:text-[#2E7D32]'}`}
    >
      <div className="w-5 h-5 flex items-center justify-center">{icon}</div>
      <span>{label}</span>
    </NavLink>
  );

  const SubNavItem = ({ to, label }: { to: string; label: string }) => (
    <NavLink 
      to={to}
      className={({isActive}) => `flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${isActive ? 'text-[#4CAF50] font-bold bg-green-50' : 'text-gray-500 hover:text-[#2E7D32] hover:bg-gray-50'}`}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50 ml-1.5" />
      <span>{label}</span>
    </NavLink>
  );

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isTeacher = user?.role === 'guru';

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-xl font-bold bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] bg-clip-text text-transparent">G7KAIH</h1>
        <button className="lg:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-lg" onClick={() => setIsMobileOpen(false)}>
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <NavItem to="/dashboard" icon="📊" label="Dashboard" />

        {user?.role === 'siswa' && (
          <>
            <NavItem to="/dashboard/journal" icon="📝" label="Jurnal Harian" />
            {hasModule('badge') && <NavItem to="/dashboard/achievements" icon="🏆" label="Koleksi Lencana" />}
          </>
        )}
        {(isAdmin || isTeacher || user?.role === 'orangtua') && <NavItem to="/dashboard/approvals" icon="✅" label="Validasi Jurnal" />}
        
        {hasModule('kalender') && <NavItem to="/dashboard/calendar" icon="📅" label="Kalender Akademik" />}
        <NavItem to="/dashboard/announcements" icon={<Megaphone size={18} />} label="Pengumuman" />
        
        {(isAdmin || isTeacher) && (
          <>
            <NavItem to="/dashboard/monitoring" icon={<BarChart3 size={18} />} label="Monitoring" />
            <NavItem to="/dashboard/class-comparison" icon="📈" label="Analitik Kelas" />
            <NavItem to="/dashboard/reports" icon="📄" label="Laporan" />
            {hasModule('evaluasi') && <NavItem to="/dashboard/evaluations" icon="📋" label="Evaluasi" />}
          </>
        )}

        {isAdmin && (
          <div className="pt-2">
            <button 
              onClick={() => toggleMenu('master')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium transition-colors ${openMenus['master'] ? 'bg-gray-50 text-gray-800' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-3">
                <Database size={18} className="text-gray-500" />
                <span>Master Data</span>
              </div>
              {openMenus['master'] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            
            <div className={`mt-1 space-y-1 overflow-hidden transition-all duration-200 pl-4 ${openMenus['master'] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {user?.role === 'superadmin' && <SubNavItem to="/dashboard/schools" label="Data Sekolah" />}
              <SubNavItem to="/dashboard/academic-years" label="Tahun & Semester" />
              <SubNavItem to="/dashboard/classes" label="Data Kelas" />
              <SubNavItem to="/dashboard/teachers" label="Data Guru" />
              <SubNavItem to="/dashboard/students" label="Data Siswa" />
              <SubNavItem to="/dashboard/parents" label="Data Orang Tua" />
              <SubNavItem to="/dashboard/mappings" label="Pemetaan Data" />
              <SubNavItem to="/dashboard/holidays" label="Hari Libur" />
              <SubNavItem to="/dashboard/habits" label="7 Kebiasaan" />
              <SubNavItem to="/dashboard/predicates" label="Predikat Nilai" />
              {hasModule('badge') && <SubNavItem to="/dashboard/badges" label="Master Badge" />}
            </div>
          </div>
        )}

        {isAdmin && (
          <>
            <NavItem to="/dashboard/school-profile" icon="🏫" label="Profil Sekolah" />
            {hasModule('timeline') && <NavItem to="/dashboard/activity-logs" icon="🕵️‍♂️" label="Log Sistem" />}
            <NavItem to="/dashboard/settings" icon="⚙️" label="Pengaturan" />
          </>
        )}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 shadow-2xl lg:shadow-none lg:static transform transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {sidebarContent}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileOpen(true)} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden">
              <Menu size={20} />
            </button>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-gray-500">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <NavLink to="/dashboard/notifications" className={({isActive}) => `relative p-2 rounded-full transition-colors ${isActive ? 'bg-green-50 text-[#4CAF50]' : 'text-gray-500 hover:bg-gray-100'}`}>
              <div className="text-lg">🔔</div>
            </NavLink>

            <NavLink to="/dashboard/profile" className={({isActive}) => `flex items-center gap-2 p-1.5 pr-3 rounded-full border transition-all ${isActive ? 'border-[#4CAF50] bg-green-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4CAF50] to-[#2E7D32] flex items-center justify-center text-white shadow-sm">
                <UserCircle size={20} />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-gray-800 leading-tight">{user?.name || 'Guest'}</p>
                <p className="text-[10px] text-gray-500 capitalize leading-tight">{user?.role || 'User'}</p>
              </div>
            </NavLink>

            <button onClick={logout} className="p-2 ml-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Keluar">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
