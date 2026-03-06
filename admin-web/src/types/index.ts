export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'OPERATOR' | 'DRIVER';
  transporte?: {
    id: string;
    nombre: string;
  };
}

export interface Transporte {
  id: string;
  nombre: string;
  activo: boolean;
  users: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  remitos: Array<{
    id: string;
    numero: string;
    estado: string;
  }>;
}

export type EstadoRemito = 'PENDIENTE' | 'ASIGNADO' | 'EN_ENTREGA' | 'ENTREGADO' | 'RECHAZADO';

export interface Remito {
  id: string;
  numero: string;
  cliente: string;
  direccion: string;
  observaciones?: string;
  archivoUrl?: string;
  estado: EstadoRemito;
  transporte?: Transporte;
  transporteId?: string;
  fechaCreacion: string;
  updatedAt: string;
  entregas: Entrega[];
}

export interface Entrega {
  id: string;
  remito: {
    id: string;
    numero: string;
    cliente: string;
    direccion: string;
  };
  firmaUrl?: string;
  fotoUrl?: string;
  nombreReceptor: string;
  lat: number;
  lng: number;
  usuario: {
    id: string;
    name: string;
    email: string;
  };
  fechaEntrega: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
