import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { remitosAPI, entregasAPI } from '../api/endpoints';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
export default function RemitoDetailPage() {
    const { id } = useParams();
    const [remito, setRemito] = useState(null);
    const [entregas, setEntregas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        loadData();
    }, [id]);
    const loadData = async () => {
        if (!id)
            return;
        try {
            setIsLoading(true);
            const [remitoRes, entregasRes] = await Promise.all([
                remitosAPI.getRemitoById(id),
                entregasAPI.getByRemito(id),
            ]);
            setRemito(remitoRes.data);
            setEntregas((entregasRes.data || []));
        }
        catch (error) {
            toast.error('Error al cargar detalle del remito');
        }
        finally {
            setIsLoading(false);
        }
    };
    const getStatusStyle = (status) => {
        switch (status) {
            case 'ENTREGADO': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'EN_ENTREGA': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'PENDIENTE': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };
    if (isLoading) {
        return (_jsxs(_Fragment, { children: [_jsx(Navbar, {}), _jsx("div", { className: "flex justify-center items-center h-[calc(100vh-80px)] bg-slate-50", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) })] }));
    }
    if (!remito) {
        return (_jsxs(_Fragment, { children: [_jsx(Navbar, {}), _jsx("div", { className: "min-h-screen bg-slate-50 p-8 flex items-center justify-center", children: _jsxs("div", { className: "max-w-md w-full card text-center", children: [_jsx("span", { className: "text-4xl mb-4 block", children: "\uD83D\uDD0D" }), _jsx("p", { className: "text-slate-500 font-bold text-lg", children: "Remito no encontrado" }), _jsx(Link, { to: "/remitos", className: "btn-secondary mt-6 inline-block", children: "Volver a la lista" })] }) })] }));
    }
    return (_jsxs(_Fragment, { children: [_jsx(Navbar, {}), _jsx("div", { className: "min-h-screen bg-slate-50 p-8 animate-fade-in", children: _jsxs("div", { className: "max-w-5xl mx-auto", children: [_jsxs(Link, { to: "/remitos", className: "inline-flex items-center text-slate-500 hover:text-blue-600 font-bold mb-8 transition-colors", children: [_jsx("span", { className: "mr-2", children: "\u2190" }), " Volver a Remitos"] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 space-y-8", children: [_jsxs("div", { className: "card !p-10 relative overflow-hidden", children: [_jsx("div", { className: "absolute top-0 right-0 p-8", children: _jsx("span", { className: `px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border ${getStatusStyle(remito.estado)}`, children: remito.estado }) }), _jsxs("div", { className: "mb-10", children: [_jsx("p", { className: "text-xs font-black text-blue-500 uppercase tracking-widest mb-2", children: "Comprobante Oficial" }), _jsx("h1", { className: "text-5xl font-black text-slate-900 tracking-tight", children: remito.numero })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-10", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xs font-black text-slate-400 uppercase tracking-widest mb-4", children: "Informaci\u00F3n del Cliente" }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-500 mb-1", children: "Nombre / Empresa" }), _jsx("p", { className: "text-xl font-bold text-slate-900", children: remito.cliente })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-500 mb-1", children: "Direcci\u00F3n de Entrega" }), _jsxs("p", { className: "text-lg font-semibold text-slate-700 flex items-start", children: [_jsx("span", { className: "mr-2 mt-1", children: "\uD83D\uDCCD" }), " ", remito.direccion] })] })] })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-xs font-black text-slate-400 uppercase tracking-widest mb-4", children: "Detalles de Carga" }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-500 mb-1", children: "Observaciones" }), _jsx("p", { className: "text-slate-600 italic", children: remito.observaciones || 'Sin observaciones adicionales' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-500 mb-1", children: "Fecha de Creaci\u00F3n" }), _jsx("p", { className: "text-slate-900 font-medium", children: new Date(remito.fechaCreacion).toLocaleDateString('es-AR', {
                                                                                        day: 'numeric', month: 'long', year: 'numeric'
                                                                                    }) })] })] })] })] })] }), entregas.length > 0 ? (_jsxs("div", { className: "card !p-10", children: [_jsx("h2", { className: "text-2xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-4", children: "Historial de Entrega" }), _jsx("div", { className: "space-y-8", children: entregas.map((entrega) => (_jsxs("div", { className: "relative pl-8 border-l-2 border-emerald-500 py-2", children: [_jsx("div", { className: "absolute -left-[11px] top-4 w-5 h-5 rounded-full bg-emerald-500 border-4 border-white" }), _jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xl font-black text-slate-900", children: entrega.nombreReceptor }), _jsxs("p", { className: "text-slate-500 font-medium text-sm", children: ["Entregado por: ", _jsx("span", { className: "text-blue-600 font-bold", children: entrega.usuario.name })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-slate-900 font-black text-sm", children: new Date(entrega.fechaEntrega).toLocaleString('es-AR') }), _jsxs("p", { className: "text-slate-400 text-xs mt-1", children: ["\uD83D\uDCE1 ", entrega.lat.toFixed(5), ", ", entrega.lng.toFixed(5)] })] })] }), entrega.firmaUrl && (_jsxs("div", { className: "mt-6", children: [_jsx("p", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2", children: "Evidencia de Entrega (Foto/Firma)" }), _jsxs("a", { href: entrega.firmaUrl, target: "_blank", rel: "noopener noreferrer", className: "inline-block group relative", children: [_jsx("img", { src: entrega.firmaUrl, alt: "Firma o Foto", className: "h-32 rounded-xl border-2 border-slate-100 hover:border-blue-500 transition-all shadow-sm" }), _jsx("div", { className: "absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center", children: _jsx("span", { className: "bg-white px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-xl", children: "Ver pantalla completa" }) })] })] }))] }, entrega.id))) })] })) : (_jsx("div", { className: "card text-center py-12 border-2 border-dashed border-slate-200 bg-slate-50/50", children: _jsx("p", { className: "text-slate-400 font-bold", children: "No hay registros de entrega para este remito a\u00FAn" }) }))] }), _jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "card !p-6 bg-slate-900 text-white", children: [_jsx("h2", { className: "text-xs font-black text-slate-400 uppercase tracking-widest mb-4", children: "Documentaci\u00F3n Digital" }), remito.archivoUrl ? (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-slate-800 p-4 rounded-xl border border-slate-700", children: [_jsx("p", { className: "text-slate-400 text-xs mb-2", children: "Archivo de Respaldo" }), _jsx("p", { className: "font-bold text-sm truncate", children: remito.archivoUrl.split('/').pop() })] }), _jsx("a", { href: remito.archivoUrl, target: "_blank", rel: "noopener noreferrer", className: "btn-primary w-full block text-center !bg-white !text-slate-900 hover:!bg-slate-100", children: "Descargar PDF / Ver" })] })) : (_jsxs("div", { className: "text-center py-6 opacity-50", children: [_jsx("span", { className: "text-3xl block mb-2", children: "\uD83D\uDCC2" }), _jsx("p", { className: "text-sm font-medium", children: "Sin documentos adjuntos" })] }))] }), _jsxs("div", { className: "card !p-6", children: [_jsx("h2", { className: "text-xs font-black text-slate-400 uppercase tracking-widest mb-4", children: "Empresa Asignada" }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-xl", children: "\uD83C\uDFE2" }), _jsxs("div", { children: [_jsx("p", { className: "font-black text-slate-900", children: remito.transporte?.nombre || _jsx("span", { className: "text-rose-500", children: "Sin asignar" }) }), _jsx("p", { className: "text-[10px] font-black text-slate-400 uppercase tracking-widest", children: "Transportista" })] })] })] })] })] })] }) })] }));
}
