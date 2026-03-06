import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { remitosAPI, transportesAPI } from '../api/endpoints';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
export default function RemitosPage() {
    const [remitos, setRemitos] = useState([]);
    const [transportes, setTransportes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        numero: '',
        cliente: '',
        direccion: '',
        observaciones: '',
        archivo: null,
    });
    const [filter, setFilter] = useState({
        estado: '',
        transporteId: '',
    });
    useEffect(() => {
        loadRemitos();
        loadTransportes();
    }, [filter]);
    const loadRemitos = async () => {
        try {
            setIsLoading(true);
            const response = await remitosAPI.getRemitos(filter.estado || undefined, filter.transporteId || undefined);
            setRemitos((response.data.remitos || []));
        }
        catch (error) {
            toast.error('Error al cargar remitos');
        }
        finally {
            setIsLoading(false);
        }
    };
    const loadTransportes = async () => {
        try {
            const response = await transportesAPI.getTransportes(true);
            setTransportes((response.data || []));
        }
        catch (error) {
            toast.error('Error al cargar transportes');
        }
    };
    const handleCreateRemito = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('numero', formData.numero);
            data.append('cliente', formData.cliente);
            data.append('direccion', formData.direccion);
            data.append('observaciones', formData.observaciones);
            if (formData.archivo) {
                data.append('archivo', formData.archivo);
            }
            await remitosAPI.createRemito(data);
            toast.success('Remito creado exitosamente');
            setShowForm(false);
            setFormData({ numero: '', cliente: '', direccion: '', observaciones: '', archivo: null });
            loadRemitos();
        }
        catch (error) {
            toast.error(error.response?.data?.error || 'Error al crear remito');
        }
    };
    const handleAssign = async (remitoId, transporteId) => {
        try {
            await remitosAPI.assignRemito(remitoId, transporteId);
            toast.success('Remito asignado exitosamente');
            loadRemitos();
        }
        catch (error) {
            toast.error(error.response?.data?.error || 'Error al asignar remito');
        }
    };
    const getEstadoBadgeColor = (estado) => {
        switch (estado) {
            case 'ENTREGADO':
                return 'badge-success';
            case 'ASIGNADO':
                return 'badge-info';
            case 'EN_ENTREGA':
                return 'badge-warning';
            default:
                return 'badge-error';
        }
    };
    return (_jsxs(_Fragment, { children: [_jsx(Navbar, {}), _jsx("div", { className: "min-h-screen bg-slate-50 p-8 animate-fade-in", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "flex justify-between items-end mb-10", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-black text-slate-900 tracking-tight", children: "Gesti\u00F3n de Remitos" }), _jsx("p", { className: "text-slate-500 mt-1 font-medium", children: "Administra y asigna \u00F3rdenes de carga" })] }), _jsx("button", { onClick: () => setShowForm(!showForm), className: showForm ? "btn-secondary" : "btn-primary", children: showForm ? 'Cancelar' : '+ Crear Remito' })] }), showForm && (_jsxs("div", { className: "card mb-10 animate-fade-in border-t-4 border-t-blue-600", children: [_jsxs("h2", { className: "text-2xl font-bold text-slate-900 mb-8 flex items-center", children: [_jsx("span", { className: "mr-3", children: "\uD83C\uDD95" }), " Nuevo Remito"] }), _jsxs("form", { onSubmit: handleCreateRemito, className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-bold text-slate-700 ml-1", children: "N\u00FAmero de Remito" }), _jsx("input", { type: "text", placeholder: "Ej: R-0001", value: formData.numero, onChange: (e) => setFormData({ ...formData, numero: e.target.value }), className: "input-field", required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-bold text-slate-700 ml-1", children: "Cliente" }), _jsx("input", { type: "text", placeholder: "Nombre del cliente", value: formData.cliente, onChange: (e) => setFormData({ ...formData, cliente: e.target.value }), className: "input-field", required: true })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-bold text-slate-700 ml-1", children: "Direcci\u00F3n de Entrega" }), _jsx("input", { type: "text", placeholder: "Calle, N\u00FAmero, Ciudad", value: formData.direccion, onChange: (e) => setFormData({ ...formData, direccion: e.target.value }), className: "input-field", required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-bold text-slate-700 ml-1", children: "Observaciones (Opcional)" }), _jsx("textarea", { placeholder: "Detalles adicionales...", value: formData.observaciones, onChange: (e) => setFormData({ ...formData, observaciones: e.target.value }), className: "input-field", rows: 3 })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-bold text-slate-700 ml-1", children: "Archivo de Respaldo" }), _jsx("input", { type: "file", onChange: (e) => setFormData({ ...formData, archivo: e.target.files?.[0] || null }), className: "input-field file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100", accept: ".pdf,.jpg,.jpeg,.png" })] }), _jsx("div", { className: "flex justify-end pt-4", children: _jsx("button", { type: "submit", className: "btn-primary w-full md:w-auto md:px-12", children: "Guardar Remito" }) })] })] })), _jsx("div", { className: "card mb-10 p-4 border border-slate-100", children: _jsxs("div", { className: "flex flex-wrap items-center gap-6", children: [_jsx("div", { className: "flex items-center space-x-3", children: _jsx("span", { className: "text-sm font-black text-slate-400 uppercase tracking-widest", children: "Filtros:" }) }), _jsx("div", { className: "flex-1 min-w-[200px]", children: _jsxs("select", { value: filter.estado, onChange: (e) => setFilter({ ...filter, estado: e.target.value }), className: "input-field !py-2 !text-sm", children: [_jsx("option", { value: "", children: "Todos los estados" }), _jsx("option", { value: "PENDIENTE", children: "\uD83D\uDD34 Pendiente" }), _jsx("option", { value: "ASIGNADO", children: "\uD83D\uDFE1 Asignado" }), _jsx("option", { value: "EN_ENTREGA", children: "\uD83D\uDD35 En entrega" }), _jsx("option", { value: "ENTREGADO", children: "\uD83D\uDFE2 Entregado" })] }) }), _jsx("div", { className: "flex-1 min-w-[200px]", children: _jsxs("select", { value: filter.transporteId, onChange: (e) => setFilter({ ...filter, transporteId: e.target.value }), className: "input-field !py-2 !text-sm", children: [_jsx("option", { value: "", children: "Todos los transportes" }), transportes.map((t) => (_jsxs("option", { value: t.id, children: ["\uD83C\uDFE2 ", t.nombre] }, t.id)))] }) })] }) }), isLoading ? (_jsx("div", { className: "flex justify-center py-20", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) })) : (_jsx("div", { className: "grid grid-cols-1 gap-4", children: remitos.length === 0 ? (_jsxs("div", { className: "card text-center py-20", children: [_jsx("span", { className: "text-4xl mb-4 block", children: "\uD83D\uDCE6" }), _jsx("p", { className: "text-slate-500 font-bold text-lg", children: "No se encontraron remitos" }), _jsx("p", { className: "text-slate-400 text-sm", children: "Prueba ajustando los filtros de b\u00FAsqueda" })] })) : (remitos.map((remito) => (_jsx("div", { className: "card hover:border-blue-200 hover:shadow-2xl transition-all duration-300 group", children: _jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-6", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-2", children: [_jsxs("span", { className: "text-xs font-black text-blue-500 bg-blue-50 px-2 py-1 rounded", children: ["#", remito.id.slice(-6)] }), _jsx("p", { className: "font-black text-2xl text-slate-900 leading-tight", children: remito.numero })] }), _jsxs("p", { className: "text-slate-600 font-bold flex items-center", children: [_jsx("span", { className: "mr-2", children: "\uD83D\uDC64" }), " ", remito.cliente] }), _jsxs("p", { className: "text-slate-400 text-sm mt-1 flex items-center", children: [_jsx("span", { className: "mr-2", children: "\uD83D\uDCCD" }), " ", remito.direccion] })] }), _jsxs("div", { className: "flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors", children: [_jsx("p", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1", children: "Empresa de Transporte" }), _jsx("p", { className: "text-slate-700 font-bold", children: remito.transporte?.nombre || _jsx("span", { className: "text-rose-400 italic font-medium", children: "Sin asignar" }) })] }), _jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-4", children: [_jsx("span", { className: `badge ${getEstadoBadgeColor(remito.estado)}`, children: remito.estado }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Link, { to: `/remitos/${remito.id}`, className: "btn-secondary !py-2 !px-4 text-sm", children: "Detalles" }), remito.estado === 'PENDIENTE' && (_jsxs("div", { className: "relative", children: [_jsxs("select", { onChange: (e) => {
                                                                        if (e.target.value) {
                                                                            handleAssign(remito.id, e.target.value);
                                                                            e.target.value = '';
                                                                        }
                                                                    }, className: "appearance-none bg-blue-600 text-white text-sm font-bold py-2 px-6 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer pr-10", children: [_jsx("option", { value: "", children: "Asignar \uD83D\uDE9A" }), transportes.map((t) => (_jsx("option", { value: t.id, children: t.nombre }, t.id)))] }), _jsx("div", { className: "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/70", children: "\u25BC" })] }))] })] })] }) }, remito.id)))) }))] }) })] }));
}
