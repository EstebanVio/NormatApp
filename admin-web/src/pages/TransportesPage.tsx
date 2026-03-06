import { useEffect, useState } from 'react';
import { Transporte } from '../types';
import { transportesAPI } from '../api/endpoints';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

export default function TransportesPage() {
  const [transportes, setTransportes] = useState<Transporte[]>([]);
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
      setTransportes(((response.data as any) || []) as Transporte[]);
    } catch (error) {
      toast.error('Error al cargar transportes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await transportesAPI.createTransporte(nombre);
      toast.success('Transporte creado exitosamente');
      setNombre('');
      setShowForm(false);
      loadTransportes();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear transporte');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Gestión de Transportes</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
            >
              {showForm ? 'Cancelar' : '+ Nuevo Transporte'}
            </button>
          </div>

          {showForm && (
            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-6">Nuevo Transporte</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre del transporte (ej: Camión 001)"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="input-field"
                  required
                />
                <button type="submit" className="btn-primary">
                  Crear Transporte
                </button>
              </form>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {transportes.map((transporte) => (
                <div key={transporte.id} className="card">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{transporte.nombre}</h3>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Estado</p>
                      <span className={`badge ${transporte.activo ? 'badge-success' : 'badge-error'}`}>
                        {transporte.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-2">Conductores ({transporte.users.length})</p>
                      {transporte.users.length > 0 ? (
                        <ul className="space-y-1">
                          {transporte.users.map((user) => (
                            <li key={user.id} className="text-sm text-gray-700">
                              • {user.name} ({user.email})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">Sin conductores asignados</p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-2">Remitos activos ({transporte.remitos.filter(r => r.estado !== 'ENTREGADO').length})</p>
                      {transporte.remitos.filter(r => r.estado !== 'ENTREGADO').length > 0 ? (
                        <ul className="space-y-1">
                          {transporte.remitos.filter(r => r.estado !== 'ENTREGADO').map((remito) => (
                            <li key={remito.id} className="text-sm text-gray-700">
                              • {remito.numero}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">Sin remitos activos</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
