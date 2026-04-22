import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { auth } from './lib/firebase';
import { Toaster } from 'react-hot-toast';
import { Button } from '@/components/ui/button';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import BorrowerDashboard from './pages/borrower/BorrowerDashboard';
import Navbar from './components/layout/Navbar';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'admin' | 'borrower' }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center h-screen flex-col gap-4">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm text-neutral-500">Checking credentials...</p>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  const userRole = profile?.role || (user.email?.toLowerCase() === 'vinaykoushikkaki@gmail.com' ? 'admin' : 'borrower');

  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const HomeRedirect = () => {
  const { user, profile, loading } = useAuth();
  
  if (loading) return (
    <div className="flex items-center justify-center h-screen flex-col gap-4">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  const userRole = profile?.role || (user.email?.toLowerCase() === 'vinaykoushikkaki@gmail.com' ? 'admin' : 'borrower');

  if (userRole === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              <Route path="/admin/*" element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard/*" element={
                <ProtectedRoute role="borrower">
                  <BorrowerDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Toaster position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}
