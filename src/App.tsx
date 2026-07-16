import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import StudentListPage from './pages/master/StudentListPage';
import TeacherListPage from './pages/master/TeacherListPage';
import JournalPage from './pages/student/JournalPage';
import JournalApprovalPage from './pages/transaction/JournalApprovalPage';
import ReportPage from './pages/transaction/ReportPage';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route element={<PublicRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>
          </Route>

          {/* Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="students" element={<StudentListPage />} />
              <Route path="teachers" element={<TeacherListPage />} />
              <Route path="journal" element={<JournalPage />} />
              <Route path="approvals" element={<JournalApprovalPage />} />
              <Route path="reports" element={<ReportPage />} />
            </Route>
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
