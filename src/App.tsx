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
import SettingsPage from './pages/master/SettingsPage';
import EvaluationPage from './pages/transaction/EvaluationPage';
import NotificationInboxPage from './pages/transaction/NotificationInboxPage';
import ActivityTimelinePage from './pages/transaction/ActivityTimelinePage';
import SchoolListPage from './pages/master/SchoolListPage';
import ClassListPage from './pages/master/ClassListPage';
import AcademicYearListPage from './pages/master/AcademicYearListPage';
import ParentListPage from './pages/master/ParentListPage';
import HolidayListPage from './pages/master/HolidayListPage';
import HabitListPage from './pages/master/HabitListPage';
import PredicateListPage from './pages/master/PredicateListPage';
import MappingPage from './pages/master/MappingPage';
import ImportDataPage from './pages/master/ImportDataPage';
import MonitoringPage from './pages/monitoring/MonitoringPage';
import ProfilePage from './pages/profile/ProfilePage';
import SchoolProfilePage from './pages/master/SchoolProfilePage';
import CalendarPage from './pages/master/CalendarPage';
import AnnouncementPage from './pages/announcement/AnnouncementPage';
import BadgeMasterPage from './pages/master/BadgeMasterPage';
import AchievementPage from './pages/transaction/AchievementPage';
import ClassComparisonPage from './pages/monitoring/ClassComparisonPage';
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
              <Route path="evaluations" element={<EvaluationPage />} />
              <Route path="notifications" element={<NotificationInboxPage />} />
              <Route path="activity-logs" element={<ActivityTimelinePage />} />
              <Route path="settings" element={<SettingsPage />} />
              
              {/* New Phase 2 Routes */}
              <Route path="schools" element={<SchoolListPage />} />
              <Route path="classes" element={<ClassListPage />} />
              <Route path="academic-years" element={<AcademicYearListPage />} />
              <Route path="parents" element={<ParentListPage />} />
              <Route path="holidays" element={<HolidayListPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="habits" element={<HabitListPage />} />
              <Route path="predicates" element={<PredicateListPage />} />
              <Route path="mappings" element={<MappingPage />} />
              <Route path="import-data" element={<ImportDataPage />} />
              
              <Route path="monitoring" element={<MonitoringPage />} />
              <Route path="class-comparison" element={<ClassComparisonPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="school-profile" element={<SchoolProfilePage />} />
              <Route path="announcements" element={<AnnouncementPage />} />
              
              {/* Gamification Routes */}
              <Route path="badges" element={<BadgeMasterPage />} />
              <Route path="achievements" element={<AchievementPage />} />
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
