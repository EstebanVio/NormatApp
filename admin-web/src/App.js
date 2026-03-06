import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
        return (_jsx("div", { className: "flex items-center justify-center h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { children: "Cargando..." })] }) }));
    }
    return (_jsxs(Router, { children: [_jsx(Toaster, { position: "top-right" }), _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/", element: _jsx(ProtectedRoute, { children: _jsx(DashboardPage, {}) }) }), _jsx(Route, { path: "/remitos", element: _jsx(ProtectedRoute, { requiredRole: ['ADMIN', 'OPERATOR'], children: _jsx(RemitosPage, {}) }) }), _jsx(Route, { path: "/remitos/:id", element: _jsx(ProtectedRoute, { children: _jsx(RemitoDetailPage, {}) }) }), _jsx(Route, { path: "/transportes", element: _jsx(ProtectedRoute, { requiredRole: ['ADMIN'], children: _jsx(TransportesPage, {}) }) }), _jsx(Route, { path: "/usuarios", element: _jsx(ProtectedRoute, { requiredRole: ['ADMIN'], children: _jsx(UsersPage, {}) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/" }) })] })] }));
}
export default App;
