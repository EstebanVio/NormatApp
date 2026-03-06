import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { transportesAPI } from '../api/endpoints';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
export default function TransportesPage() {
    const [transportes, setTransportes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [nombre, setNombre] = useState('');
    useEffect(() => {
        loadTransportes();
    }, []);
    const loadTransportes = async () => {
        try {
            setIsLoading(true);
            const response = await transportesAPI.getTransportes(false);
            setTransportes((response.data || []));
        }
        catch (error) {
            toast.error('Error al cargar transportes');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await transportesAPI.createTransporte(nombre);
            toast.success('Transporte creado exitosamente');
            setNombre('');
            setShowForm(false);
            loadTransportes();
        }
        catch (error) {
            toast.error(error.response?.data?.error || 'Error al crear transporte');
        }
    };
    return (_jsxs(_Fragment, { children: [_jsx(Navbar, {}), _jsx("div", { className: "min-h-screen bg-gray-50 p-8", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "flex justify-between items-center mb-8", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-900", children: "Gesti\u00F3n de Transportes" }), _jsx("button", { onClick: () => setShowForm(!showForm), className: "btn-primary", children: showForm ? 'Cancelar' : '+ Nuevo Transporte' })] }), showForm && (_jsxs("div", { className: "card mb-8", children: [_jsx("h2", { className: "text-2xl font-bold mb-6", children: "Nuevo Transporte" }), _jsxs("form", { onSubmit: handleCreate, className: "space-y-4", children: [_jsx("input", { type: "text", placeholder: "Nombre del transporte (ej: Cami\u00F3n 001)", value: nombre, onChange: (e) => setNombre(e.target.value), className: "input-field", required: true }), _jsx("button", { type: "submit", className: "btn-primary", children: "Crear Transporte" })] })] })), isLoading ? (_jsx("div", { className: "flex justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: transportes.map((transporte) => (_jsxs("div", { className: "card", children: [_jsx("h3", { className: "text-xl font-bold text-gray-900 mb-4", children: transporte.nombre }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Estado" }), _jsx("span", { className: `badge ${transporte.activo ? 'badge-success' : 'badge-error'}`, children: transporte.activo ? 'Activo' : 'Inactivo' })] }), _jsxs("div", { children: [_jsxs("p", { className: "text-sm text-gray-500 mb-2", children: ["Conductores (", transporte.users.length, ")"] }), transporte.users.length > 0 ? (_jsx("ul", { className: "space-y-1", children: transporte.users.map((user) => (_jsxs("li", { className: "text-sm text-gray-700", children: ["\u2022 ", user.name, " (", user.email, ")"] }, user.id))) })) : (_jsx("p", { className: "text-sm text-gray-500", children: "Sin conductores asignados" }))] }), _jsxs("div", { children: [_jsxs("p", { className: "text-sm text-gray-500 mb-2", children: ["Remitos activos (", transporte.remitos.filter(r => r.estado !== 'ENTREGADO').length, ")"] }), transporte.remitos.filter(r => r.estado !== 'ENTREGADO').length > 0 ? (_jsx("ul", { className: "space-y-1", children: transporte.remitos.filter(r => r.estado !== 'ENTREGADO').map((remito) => (_jsxs("li", { className: "text-sm text-gray-700", children: ["\u2022 ", remito.numero] }, remito.id))) })) : (_jsx("p", { className: "text-sm text-gray-500", children: "Sin remitos activos" }))] })] })] }, transporte.id))) }))] }) })] }));
}
