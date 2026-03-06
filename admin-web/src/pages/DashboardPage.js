import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSocket } from '../hooks/useSocket';
import { remitosAPI } from '../api/endpoints';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
export default function DashboardPage() {
    const { user } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const [stats, setStats] = useState({
        totalRemitos: 0,
        remitosEntregados: 0,
        remitosAsignados: 0,
        conductoesOnline: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const loadStats = async () => {
            try {
                const response = await remitosAPI.getRemitos(undefined, undefined, 1, 100);
                const remitos = response.data.remitos || [];
                setStats({
                    totalRemitos: response.data.total || 0,
                    remitosEntregados: remitos.filter((r) => r.estado === 'ENTREGADO').length,
                    remitosAsignados: remitos.filter((r) => r.estado === 'ASIGNADO').length,
                    conductoesOnline: isConnected ? 1 : 0,
                });
            }
            catch (error) {
                toast.error('Error al cargar estadísticas');
            }
            finally {
                setIsLoading(false);
            }
        };
        loadStats();
    }, [isConnected]);
    useEffect(() => {
        if (!socket)
            return;
        socket.on('notification:driver_online', () => {
            setStats((prev) => ({
                ...prev,
                conductoesOnline: prev.conductoesOnline + 1,
            }));
        });
        socket.on('notification:remito_delivered', (data) => {
            setStats((prev) => ({
                ...prev,
                remitosEntregados: prev.remitosEntregados + 1,
                remitosAsignados: prev.remitosAsignados - 1,
            }));
            toast.success(`Remito ${data.remitoId} entregado`);
        });
        return () => {
            socket.off('notification:driver_online');
            socket.off('notification:remito_delivered');
        };
    }, [socket]);
    return (_jsxs(_Fragment, { children: [_jsx(Navbar, {}), _jsx("div", { className: "min-h-screen bg-slate-50 p-8 animate-fade-in", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-10", children: [_jsxs("h1", { className: "text-4xl font-black text-slate-900 tracking-tight", children: ["Bienvenido, ", user?.name] }), _jsx("p", { className: "text-slate-500 mt-2 font-medium", children: "Panel de administraci\u00F3n \u2022 Sistema de Remitos Digitales" })] }), isLoading ? (_jsx("div", { className: "flex justify-center py-20", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) })) : (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8", children: [_jsx(StatCard, { title: "Total de Remitos", value: stats.totalRemitos, icon: "\uD83D\uDCC4", color: "blue" }), _jsx(StatCard, { title: "Remitos Entregados", value: stats.remitosEntregados, icon: "\u2705", color: "green" }), _jsx(StatCard, { title: "Remitos Asignados", value: stats.remitosAsignados, icon: "\uD83D\uDE9A", color: "yellow" }), _jsx(StatCard, { title: "Conductores Online", value: stats.conductoesOnline, icon: "\uD83C\uDF10", color: "purple" })] })), _jsxs("div", { className: "mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "card lg:col-span-2", children: [_jsx("h2", { className: "text-xl font-bold text-slate-900 mb-6", children: "Acciones R\u00E1pidas" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsxs(Link, { to: "/remitos", className: "flex flex-col items-center justify-center p-6 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all group", children: [_jsx("span", { className: "text-2xl mb-2 group-hover:scale-110 transition-transform", children: "\uD83D\uDCDD" }), _jsx("span", { className: "font-bold", children: "Gestionar Remitos" })] }), _jsxs(Link, { to: "/transportes", className: "flex flex-col items-center justify-center p-6 rounded-2xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all group", children: [_jsx("span", { className: "text-2xl mb-2 group-hover:scale-110 transition-transform", children: "\uD83C\uDFE2" }), _jsx("span", { className: "font-bold", children: "Ver Transportes" })] }), _jsxs(Link, { to: "/usuarios", className: "flex flex-col items-center justify-center p-6 rounded-2xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all group", children: [_jsx("span", { className: "text-2xl mb-2 group-hover:scale-110 transition-transform", children: "\uD83D\uDC65" }), _jsx("span", { className: "font-bold", children: "Gestionar Usuarios" })] })] })] }), _jsxs("div", { className: "card border-l-4 border-l-blue-500", children: [_jsx("h2", { className: "text-xl font-bold text-slate-900 mb-6", children: "Estado del Sistema" }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between p-3 rounded-xl bg-slate-50", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}` }), _jsx("span", { className: "text-slate-700 font-semibold", children: "Websocket" })] }), _jsx("span", { className: `badge ${isConnected ? 'badge-success' : 'badge-error'}`, children: isConnected ? 'Online' : 'Offline' })] }), _jsxs("div", { className: "flex items-center justify-between p-3 rounded-xl bg-slate-50", children: [_jsx("span", { className: "text-slate-700 font-semibold ml-6", children: "Sesi\u00F3n Activa" }), _jsx("span", { className: "badge badge-info", children: user?.role })] })] })] })] })] }) })] }));
}
function StatCard({ title, value, icon, color }) {
    const colorStyles = {
        blue: 'from-blue-500 to-blue-700 shadow-blue-100',
        green: 'from-emerald-500 to-emerald-700 shadow-emerald-100',
        yellow: 'from-amber-500 to-amber-700 shadow-amber-100',
        purple: 'from-violet-500 to-violet-700 shadow-violet-100',
    };
    return (_jsxs("div", { className: `relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br ${colorStyles[color]} shadow-2xl transition-transform hover:-translate-y-1`, children: [_jsx("div", { className: "absolute top-0 right-0 p-4 text-4xl opacity-20 transform translate-x-2 -translate-y-2", children: icon }), _jsx("h3", { className: "text-white/80 text-sm font-bold uppercase tracking-wider", children: title }), _jsx("p", { className: "text-4xl font-black text-white mt-4 tracking-tighter", children: value }), _jsx("div", { className: "mt-4 w-full h-1 bg-white/20 rounded-full overflow-hidden", children: _jsx("div", { className: "w-2/3 h-full bg-white/40" }) })] }));
}
