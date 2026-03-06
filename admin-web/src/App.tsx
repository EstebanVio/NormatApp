import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RemitosPage from './pages/RemitosPage';
import RemitoDetailPage from './pages/RemitoDetailPage';
import TransportesPage from './pages/TransportesPage';
import UsersPage from './pages/UsersPage';
import './index.css';
import { Toaster } from 'react-hot-toast';

function App() {
  const { loadCurrentUser, isLoading } = useAuthStore();

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/remitos"
          element={
            <ProtectedRoute requiredRole={['ADMIN', 'OPERATOR']}>
              <RemitosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/remitos/:id"
          element={
            <ProtectedRoute>
              <RemitoDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transportes"
          element={
            <ProtectedRoute requiredRole={['ADMIN']}>
              <TransportesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute requiredRole={['ADMIN']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
