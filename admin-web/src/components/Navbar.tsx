import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <nav className="glass-panel sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-12">
            <Link to="/" className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              NORMAT
            </Link>
            <div className="flex space-x-8">
              <Link to="/remitos" className="text-slate-600 font-medium hover:text-blue-600 transition-colors">
                Remitos
              </Link>
              {user?.role === 'ADMIN' && (
                <>
                  <Link to="/transportes" className="text-slate-600 font-medium hover:text-blue-600 transition-colors">
                    Transportes
                  </Link>
                  <Link to="/usuarios" className="text-slate-600 font-medium hover:text-blue-600 transition-colors">
                    Usuarios
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-slate-800">{user?.name}</span>
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">{user?.role}</span>
            </div>
            <button
              onClick={logout}
              className="btn-danger !py-2 !px-4 text-sm"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
