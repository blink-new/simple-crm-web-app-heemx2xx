
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import ContactsPage from '../pages/contacts/ContactsPage';
import ContactDetailPage from '../pages/contacts/ContactDetailPage';
import ContactFormPage from '../pages/contacts/ContactFormPage';
import SettingsPage from '../pages/settings/SettingsPage';
import TagsPage from '../pages/tags/TagsPage';
import MainLayout from './layout/MainLayout';

// Auth callback handler
function AuthCallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Authentication Successful</h2>
          <p className="text-gray-600">
            You have been successfully authenticated. Redirecting you to the dashboard...
          </p>
        </div>
      </div>
    </div>
  );
}

// Loading component with animation
function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600">
      <div className="text-center">
        <div className="inline-block h-16 w-16 animate-pulse rounded-full bg-white p-2">
          <div className="h-full w-full animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-white">Loading...</h2>
      </div>
    </div>
  );
}

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="contacts/new" element={<ContactFormPage />} />
        <Route path="contacts/:id" element={<ContactDetailPage />} />
        <Route path="contacts/:id/edit" element={<ContactFormPage />} />
        <Route path="tags" element={<TagsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}