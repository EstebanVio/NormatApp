import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
export default function LoginPage() {
    const navigate = useNavigate();
    const { login, isLoading, error } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            toast.success('¡Sesión iniciada!');
            navigate('/');
        }
        catch (err) {
            toast.error(err.message || 'Error al iniciar sesión');
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center", children: _jsxs("div", { className: "bg-white rounded-lg shadow-lg p-8 w-full max-w-md", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-800 mb-2 text-center", children: "Remitos Digitales" }), _jsx("p", { className: "text-center text-gray-600 mb-8", children: "Panel de Administraci\u00F3n" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Email" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "input-field", placeholder: "admin@remitos.local", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Contrase\u00F1a" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "input-field", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true })] }), error && _jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded", children: error }), _jsx("button", { type: "submit", disabled: isLoading, className: "btn-primary w-full", children: isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' })] }), _jsxs("div", { className: "mt-8 p-4 bg-blue-50 rounded border border-blue-200", children: [_jsx("p", { className: "text-sm text-blue-800 font-semibold mb-2", children: "Credenciales de prueba:" }), _jsxs("p", { className: "text-xs text-blue-700", children: [_jsx("strong", { children: "Email:" }), " admin@remitos.local", _jsx("br", {}), _jsx("strong", { children: "Contrase\u00F1a:" }), " admin123"] })] })] }) }));
}
