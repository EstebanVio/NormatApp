import { useEffect, useState } from 'react';
import { usersAPI, transportesAPI } from '../api/endpoints';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { Transporte } from '../types';

interface UserData {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'OPERATOR' | 'DRIVER';
  transporte?: { id: string; nombre: string } | null;
  createdAt: string;
}

const ROLES = ['ADMIN', 'OPERATOR', 'DRIVER'];

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [transportes, setTransportes] = useState<Transporte[]>([]);
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
      setUsers(((usersRes.data as any).users || []) as UserData[]);
      setTransportes(((transportesRes.data as any) || []) as Transporte[]);
    } catch (error) {
      toast.error('Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await usersAPI.createUser(
        formData.email,
        formData.name,
        formData.password,
        formData.role,
        formData.transporteId || undefined
      );
      toast.success('Usuario creado exitosamente');
      setShowForm(false);
      setFormData({ email: '', name: '', password: '', role: 'DRIVER', transporteId: '' });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear usuario');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar al usuario ${name}?`)) return;
    try {
      await usersAPI.deleteUser(id);
      toast.success('Usuario eliminado');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al eliminar usuario');
    }
  };

  const handleChangeRole = async (id: string, nuevoRol: string) => {
    try {
      await usersAPI.changeRole(id, nuevoRol);
      toast.success('Rol actualizado');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al cambiar rol');
    }
  };

  const getRoleBadgeColor = (role: string) => {
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary">
              {showForm ? 'Cancelar' : '+ Nuevo Usuario'}
            </button>
          </div>

          {showForm && (
            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-6">Nuevo Usuario</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Contraseña (mínimo 6 caracteres)"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field"
                    required
                    minLength={6}
                  />
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input-field"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  {formData.role === 'DRIVER' && (
                    <select
                      value={formData.transporteId}
                      onChange={(e) => setFormData({ ...formData, transporteId: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Sin transporte asignado</option>
                      {transportes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nombre}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <button type="submit" className="btn-primary">
                  Crear Usuario
                </button>
              </form>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-600 font-semibold">Nombre</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-semibold">Email</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-semibold">Rol</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-semibold">Transporte</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">
                          No hay usuarios registrados
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{user.name}</td>
                          <td className="py-3 px-4 text-gray-600">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className={`badge ${getRoleBadgeColor(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {user.transporte?.nombre || '—'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <select
                                defaultValue={user.role}
                                onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                className="input-field py-1 px-2 text-xs"
                              >
                                {ROLES.map((r) => (
                                  <option key={r} value={r}>
                                    {r}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleDelete(user.id, user.name)}
                                className="btn-danger py-1 px-3 text-xs"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
