import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { usersAPI, transportesAPI } from '../api/endpoints';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
const ROLES = ['ADMIN', 'OPERATOR', 'DRIVER'];
export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [transportes, setTransportes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        password: '',
        role: 'DRIVER',
        transporteId: '',
    });
    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        try {
            setIsLoading(true);
            const [usersRes, transportesRes] = await Promise.all([
                usersAPI.getUsers(),
                transportesAPI.getTransportes(false),
            ]);
            setUsers((usersRes.data.users || []));
            setTransportes((transportesRes.data || []));
        }
        catch (error) {
            toast.error('Error al cargar usuarios');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await usersAPI.createUser(formData.email, formData.name, formData.password, formData.role, formData.transporteId || undefined);
            toast.success('Usuario creado exitosamente');
            setShowForm(false);
            setFormData({ email: '', name: '', password: '', role: 'DRIVER', transporteId: '' });
            loadData();
        }
        catch (error) {
            toast.error(error.response?.data?.error || 'Error al crear usuario');
        }
    };
    const handleDelete = async (id, name) => {
        if (!confirm(`¿Eliminar al usuario ${name}?`))
            return;
        try {
            await usersAPI.deleteUser(id);
            toast.success('Usuario eliminado');
            loadData();
        }
        catch (error) {
            toast.error(error.response?.data?.error || 'Error al eliminar usuario');
        }
    };
    const handleChangeRole = async (id, nuevoRol) => {
        try {
            await usersAPI.changeRole(id, nuevoRol);
            toast.success('Rol actualizado');
            loadData();
        }
        catch (error) {
            toast.error(error.response?.data?.error || 'Error al cambiar rol');
        }
    };
    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'ADMIN':
                return 'badge-error';
            case 'OPERATOR':
                return 'badge-info';
            case 'DRIVER':
                return 'badge-success';
            default:
                return 'badge-warning';
        }
    };
    return (_jsxs(_Fragment, { children: [_jsx(Navbar, {}), _jsx("div", { className: "min-h-screen bg-gray-50 p-8", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "flex justify-between items-center mb-8", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-900", children: "Gesti\u00F3n de Usuarios" }), _jsx("button", { onClick: () => setShowForm(!showForm), className: "btn-primary", children: showForm ? 'Cancelar' : '+ Nuevo Usuario' })] }), showForm && (_jsxs("div", { className: "card mb-8", children: [_jsx("h2", { className: "text-2xl font-bold mb-6", children: "Nuevo Usuario" }), _jsxs("form", { onSubmit: handleCreate, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx("input", { type: "text", placeholder: "Nombre completo", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), className: "input-field", required: true }), _jsx("input", { type: "email", placeholder: "Email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), className: "input-field", required: true }), _jsx("input", { type: "password", placeholder: "Contrase\u00F1a (m\u00EDnimo 6 caracteres)", value: formData.password, onChange: (e) => setFormData({ ...formData, password: e.target.value }), className: "input-field", required: true, minLength: 6 }), _jsx("select", { value: formData.role, onChange: (e) => setFormData({ ...formData, role: e.target.value }), className: "input-field", children: ROLES.map((r) => (_jsx("option", { value: r, children: r }, r))) }), formData.role === 'DRIVER' && (_jsxs("select", { value: formData.transporteId, onChange: (e) => setFormData({ ...formData, transporteId: e.target.value }), className: "input-field", children: [_jsx("option", { value: "", children: "Sin transporte asignado" }), transportes.map((t) => (_jsx("option", { value: t.id, children: t.nombre }, t.id)))] }))] }), _jsx("button", { type: "submit", className: "btn-primary", children: "Crear Usuario" })] })] })), isLoading ? (_jsx("div", { className: "flex justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) })) : (_jsx("div", { className: "card", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-gray-200", children: [_jsx("th", { className: "text-left py-3 px-4 text-gray-600 font-semibold", children: "Nombre" }), _jsx("th", { className: "text-left py-3 px-4 text-gray-600 font-semibold", children: "Email" }), _jsx("th", { className: "text-left py-3 px-4 text-gray-600 font-semibold", children: "Rol" }), _jsx("th", { className: "text-left py-3 px-4 text-gray-600 font-semibold", children: "Transporte" }), _jsx("th", { className: "text-left py-3 px-4 text-gray-600 font-semibold", children: "Acciones" })] }) }), _jsx("tbody", { children: users.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "text-center py-8 text-gray-500", children: "No hay usuarios registrados" }) })) : (users.map((user) => (_jsxs("tr", { className: "border-b border-gray-100 hover:bg-gray-50", children: [_jsx("td", { className: "py-3 px-4 font-medium text-gray-900", children: user.name }), _jsx("td", { className: "py-3 px-4 text-gray-600", children: user.email }), _jsx("td", { className: "py-3 px-4", children: _jsx("span", { className: `badge ${getRoleBadgeColor(user.role)}`, children: user.role }) }), _jsx("td", { className: "py-3 px-4 text-gray-600", children: user.transporte?.nombre || '—' }), _jsx("td", { className: "py-3 px-4", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("select", { defaultValue: user.role, onChange: (e) => handleChangeRole(user.id, e.target.value), className: "input-field py-1 px-2 text-xs", children: ROLES.map((r) => (_jsx("option", { value: r, children: r }, r))) }), _jsx("button", { onClick: () => handleDelete(user.id, user.name), className: "btn-danger py-1 px-3 text-xs", children: "Eliminar" })] }) })] }, user.id)))) })] }) }) }))] }) })] }));
}
