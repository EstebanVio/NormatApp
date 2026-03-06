import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Remito, Entrega } from '../types';
import { remitosAPI, entregasAPI } from '../api/endpoints';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

export default function RemitoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [remito, setRemito] = useState<Remito | null>(null);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const [remitoRes, entregasRes] = await Promise.all([
        remitosAPI.getRemitoById(id),
        entregasAPI.getByRemito(id),
      ]);

      setRemito((remitoRes.data as any) as Remito);
      setEntregas(((entregasRes.data as any) || []) as Entrega[]);
    } catch (error) {
      toast.error('Error al cargar detalle del remito');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ENTREGADO': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'EN_ENTREGA': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'PENDIENTE': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-80px)] bg-slate-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  if (!remito) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
          <div className="max-w-md w-full card text-center">
            <span className="text-4xl mb-4 block">🔍</span>
            <p className="text-slate-500 font-bold text-lg">Remito no encontrado</p>
            <Link to="/remitos" className="btn-secondary mt-6 inline-block">Volver a la lista</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 p-8 animate-fade-in">
        <div className="max-w-5xl mx-auto">
          <Link to="/remitos" className="inline-flex items-center text-slate-500 hover:text-blue-600 font-bold mb-8 transition-colors">
            <span className="mr-2">←</span> Volver a Remitos
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="card !p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                  <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border ${getStatusStyle(remito.estado)}`}>
                    {remito.estado}
                  </span>
                </div>

                <div className="mb-10">
                  <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-2">Comprobante Oficial</p>
                  <h1 className="text-5xl font-black text-slate-900 tracking-tight">
                    {remito.numero}
                  </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Información del Cliente</h2>
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Nombre / Empresa</p>
                        <p className="text-xl font-bold text-slate-900">{remito.cliente}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Dirección de Entrega</p>
                        <p className="text-lg font-semibold text-slate-700 flex items-start">
                          <span className="mr-2 mt-1">📍</span> {remito.direccion}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Detalles de Carga</h2>
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Observaciones</p>
                        <p className="text-slate-600 italic">
                          {remito.observaciones || 'Sin observaciones adicionales'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Fecha de Creación</p>
                        <p className="text-slate-900 font-medium">
                          {new Date(remito.fechaCreacion).toLocaleDateString('es-AR', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {entregas.length > 0 ? (
                <div className="card !p-10">
                  <h2 className="text-2xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-4">
                    Historial de Entrega
                  </h2>

                  <div className="space-y-8">
                    {entregas.map((entrega) => (
                      <div key={entrega.id} className="relative pl-8 border-l-2 border-emerald-500 py-2">
                        <div className="absolute -left-[11px] top-4 w-5 h-5 rounded-full bg-emerald-500 border-4 border-white"></div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <p className="text-xl font-black text-slate-900">{entrega.nombreReceptor}</p>
                            <p className="text-slate-500 font-medium text-sm">
                              Entregado por: <span className="text-blue-600 font-bold">{entrega.usuario.name}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-slate-900 font-black text-sm">
                              {new Date(entrega.fechaEntrega).toLocaleString('es-AR')}
                            </p>
                            <p className="text-slate-400 text-xs mt-1">
                              📡 {entrega.lat.toFixed(5)}, {entrega.lng.toFixed(5)}
                            </p>
                          </div>
                        </div>

                        {entrega.firmaUrl && (
                          <div className="mt-6">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Evidencia de Entrega (Foto/Firma)</p>
                            <a
                              href={entrega.firmaUrl?.startsWith('http') ? entrega.firmaUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${entrega.firmaUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block group relative"
                            >
                              <img
                                src={entrega.firmaUrl?.startsWith('http') ? entrega.firmaUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${entrega.firmaUrl}`}
                                alt="Firma o Foto"
                                className="h-32 rounded-xl border-2 border-slate-100 hover:border-blue-500 transition-all shadow-sm"
                              />
                              <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-xl">Ver pantalla completa</span>
                              </div>
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="card text-center py-12 border-2 border-dashed border-slate-200 bg-slate-50/50">
                  <p className="text-slate-400 font-bold">No hay registros de entrega para este remito aún</p>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="card !p-6 bg-slate-900 text-white">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Documentación Digital</h2>
                {remito.archivoUrl ? (
                  <div className="space-y-6">
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                      <p className="text-slate-400 text-xs mb-2">Archivo de Respaldo</p>
                      <p className="font-bold text-sm truncate">{remito.archivoUrl.split('/').pop()}</p>
                    </div>
                    <a
                      href={remito.archivoUrl?.startsWith('http') ? remito.archivoUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${remito.archivoUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary w-full block text-center !bg-white !text-slate-900 hover:!bg-slate-100"
                    >
                      Descargar PDF / Ver
                    </a>
                  </div>
                ) : (
                  <div className="text-center py-6 opacity-50">
                    <span className="text-3xl block mb-2">📂</span>
                    <p className="text-sm font-medium">Sin documentos adjuntos</p>
                  </div>
                )}
              </div>

              <div className="card !p-6">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Empresa Asignada</h2>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-xl">
                    🏢
                  </div>
                  <div>
                    <p className="font-black text-slate-900">
                      {remito.transporte?.nombre || <span className="text-rose-500">Sin asignar</span>}
                    </p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transportista</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
