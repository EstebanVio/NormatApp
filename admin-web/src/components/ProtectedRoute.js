import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';
export function ProtectedRoute({ children, requiredRole }) {
    const { isAuthenticated, user, isLoading } = useAuthStore();
    if (isLoading) {
        return _jsx("div", { className: "flex items-center justify-center h-screen", children: "Cargando..." });
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/login" });
    }
    if (requiredRole && user && !requiredRole.includes(user.role)) {
        return _jsx(Navigate, { to: "/" });
    }
    return _jsx(_Fragment, { children: children });
}
