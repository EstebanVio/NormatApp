import { useEffect, useState } from 'react';
import { Remito, Transporte } from '../types';
import { remitosAPI, transportesAPI } from '../api/endpoints';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function RemitosPage() {
  const [remitos, setRemitos] = useState<Remito[]>([]);
  const [transportes, setTransportes] = useState<Transporte[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    numero: '',
    cliente: '',
    direccion: '',
    observaciones: '',
    archivo: null as File | null,
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
      setRemitos(((response.data as any).remitos || []) as Remito[]);
    } catch (error) {
      toast.error('Error al cargar remitos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransportes = async () => {
    try {
      const response = await transportesAPI.getTransportes(true);
      setTransportes(((response.data as any) || []) as Transporte[]);
    } catch (error) {
      toast.error('Error al cargar transportes');
    }
  };

  const handleCreateRemito = async (e: React.FormEvent) => {
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
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear remito');
    }
  };

  const handleAssign = async (remitoId: string, transporteId: string) => {
    try {
      await remitosAPI.assignRemito(remitoId, transporteId);
      toast.success('Remito asignado exitosamente');
      loadRemitos();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al asignar remito');
    }
  };

  const getEstadoBadgeColor = (estado: string) => {
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Gestión de Remitos</h1>
              <p className="text-slate-500 mt-1 font-medium">Administra y asigna órdenes de carga</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className={showForm ? "btn-secondary" : "btn-primary"}
            >
              {showForm ? 'Cancelar' : '+ Crear Remito'}
            </button>
          </div>

          {showForm && (
            <div className="card mb-10 animate-fade-in border-t-4 border-t-blue-600">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
                <span className="mr-3">🆕</span> Nuevo Remito
              </h2>
              <form onSubmit={handleCreateRemito} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Número de Remito</label>
                    <input
                      type="text"
                      placeholder="Ej: R-0001"
                      value={formData.numero}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Cliente (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Se puede completar luego"
                      value={formData.cliente}
                      onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Dirección de Entrega (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Se puede completar luego"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Observaciones (Opcional)</label>
                  <textarea
                    placeholder="Detalles adicionales..."
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    className="input-field"
                    rows={3}
                  />
                </div>
                <div className="space-y-2 p-4 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200">
                  <label className="text-sm font-bold text-blue-800 ml-1 flex items-center">
                    <span className="mr-2">📄</span> Archivo del Remito (Obligatorio)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setFormData(prev => ({
                        ...prev,
                        archivo: file,
                        numero: prev.numero || file?.name.split('.')[0] || ''
                      }));
                    }}
                    className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                  />
                  <p className="text-[10px] text-blue-500 font-bold mt-2">Formatos permitidos: PDF, JPG, PNG. El nombre del archivo se usará como número si está vacío.</p>
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="btn-primary w-full md:w-auto md:px-12 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!formData.archivo}
                  >
                    Guardar Remito
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filters */}
          <div className="card mb-10 p-4 border border-slate-100">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Filtros:</span>
              </div>
              <div className="flex-1 min-w-[200px]">
                <select
                  value={filter.estado}
                  onChange={(e) => setFilter({ ...filter, estado: e.target.value })}
                  className="input-field !py-2 !text-sm"
                >
                  <option value="">Todos los estados</option>
                  <option value="PENDIENTE">🔴 Pendiente</option>
                  <option value="ASIGNADO">🟡 Asignado</option>
                  <option value="EN_ENTREGA">🔵 En entrega</option>
                  <option value="ENTREGADO">🟢 Entregado</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <select
                  value={filter.transporteId}
                  onChange={(e) => setFilter({ ...filter, transporteId: e.target.value })}
                  className="input-field !py-2 !text-sm"
                >
                  <option value="">Todos los transportes</option>
                  {transportes.map((t) => (
                    <option key={t.id} value={t.id}>
                      🏢 {t.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Remitos list */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {remitos.length === 0 ? (
                <div className="card text-center py-20">
                  <span className="text-4xl mb-4 block">📦</span>
                  <p className="text-slate-500 font-bold text-lg">No se encontraron remitos</p>
                  <p className="text-slate-400 text-sm">Prueba ajustando los filtros de búsqueda</p>
                </div>
              ) : (
                remitos.map((remito) => (
                  <div key={remito.id} className="card hover:border-blue-200 hover:shadow-2xl transition-all duration-300 group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-xs font-black text-blue-500 bg-blue-50 px-2 py-1 rounded">#{remito.id.slice(-6)}</span>
                          <p className="font-black text-2xl text-slate-900 leading-tight">
                            {remito.numero}
                          </p>
                        </div>
                        <p className="text-slate-600 font-bold flex items-center">
                          <span className="mr-2">👤</span> {remito.cliente}
                        </p>
                        <p className="text-slate-400 text-sm mt-1 flex items-center">
                          <span className="mr-2">📍</span> {remito.direccion}
                        </p>
                      </div>

                      <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Empresa de Transporte</p>
                        <p className="text-slate-700 font-bold">
                          {remito.transporte?.nombre || <span className="text-rose-400 italic font-medium">Sin asignar</span>}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <span className={`badge ${getEstadoBadgeColor(remito.estado)}`}>
                          {remito.estado}
                        </span>

                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/remitos/${remito.id}`}
                            className="btn-secondary !py-2 !px-4 text-sm"
                          >
                            Detalles
                          </Link>

                          {remito.estado === 'PENDIENTE' && (
                            <div className="relative">
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleAssign(remito.id, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                                className="appearance-none bg-blue-600 text-white text-sm font-bold py-2 px-6 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer pr-10"
                              >
                                <option value="">Asignar 🚚</option>
                                {transportes.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.nombre}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/70">
                                ▼
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
