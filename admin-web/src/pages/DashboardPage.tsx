import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSocket } from '../hooks/useSocket';
import { remitosAPI } from '../api/endpoints';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Stats {
  totalRemitos: number;
  remitosEntregados: number;
  remitosAsignados: number;
  conductoesOnline: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { socket, isConnected } = useSocket();
  const [stats, setStats] = useState<Stats>({
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
        const remitos = (response.data as any).remitos || [];

        setStats({
          totalRemitos: (response.data as any).total || 0,
          remitosEntregados: remitos.filter((r: any) => r.estado === 'ENTREGADO').length,
          remitosAsignados: remitos.filter((r: any) => r.estado === 'ASIGNADO').length,
          conductoesOnline: isConnected ? 1 : 0,
        });
      } catch (error) {
        toast.error('Error al cargar estadísticas');
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [isConnected]);

  useEffect(() => {
    if (!socket) return;

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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Bienvenido, {user?.name}
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Panel de administración • Sistema de Remitos Digitales</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <StatCard
                title="Total de Remitos"
                value={stats.totalRemitos}
                icon="📄"
                color="blue"
              />
              <StatCard
                title="Remitos Entregados"
                value={stats.remitosEntregados}
                icon="✅"
                color="green"
              />
              <StatCard
                title="Remitos Asignados"
                value={stats.remitosAsignados}
                icon="🚚"
                color="yellow"
              />
              <StatCard
                title="Conductores Online"
                value={stats.conductoesOnline}
                icon="🌐"
                color="purple"
              />
            </div>
          )}

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="card lg:col-span-2">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Acciones Rápidas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                  to="/remitos"
                  className="flex flex-col items-center justify-center p-6 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all group"
                >
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📝</span>
                  <span className="font-bold">Gestionar Remitos</span>
                </Link>
                <Link
                  to="/transportes"
                  className="flex flex-col items-center justify-center p-6 rounded-2xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all group"
                >
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🏢</span>
                  <span className="font-bold">Ver Transportes</span>
                </Link>
                <Link
                  to="/usuarios"
                  className="flex flex-col items-center justify-center p-6 rounded-2xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all group"
                >
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">👥</span>
                  <span className="font-bold">Gestionar Usuarios</span>
                </Link>
              </div>
            </div>

            <div className="card border-l-4 border-l-blue-500">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Estado del Sistema</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                    <span className="text-slate-700 font-semibold">Websocket</span>
                  </div>
                  <span className={`badge ${isConnected ? 'badge-success' : 'badge-error'}`}>
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <span className="text-slate-700 font-semibold ml-6">Sesión Activa</span>
                  <span className="badge badge-info">{user?.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorStyles = {
    blue: 'from-blue-500 to-blue-700 shadow-blue-100',
    green: 'from-emerald-500 to-emerald-700 shadow-emerald-100',
    yellow: 'from-amber-500 to-amber-700 shadow-amber-100',
    purple: 'from-violet-500 to-violet-700 shadow-violet-100',
  };

  return (
    <div className={`relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br ${colorStyles[color]} shadow-2xl transition-transform hover:-translate-y-1`}>
      <div className="absolute top-0 right-0 p-4 text-4xl opacity-20 transform translate-x-2 -translate-y-2">
        {icon}
      </div>
      <h3 className="text-white/80 text-sm font-bold uppercase tracking-wider">{title}</h3>
      <p className="text-4xl font-black text-white mt-4 tracking-tighter">{value}</p>
      <div className="mt-4 w-full h-1 bg-white/20 rounded-full overflow-hidden">
        <div className="w-2/3 h-full bg-white/40"></div>
      </div>
    </div>
  );
}
