export interface User {
  id: string;
  email: string;
  name: string;
  role: 'DRIVER';
  transporte?: {
    id: string;
    nombre: string;
  };
}

export interface Remito {
  id: string;
  numero: string;
  cliente: string;
  direccion: string;
  observaciones?: string;
  archivoUrl?: string;
  estado: 'PENDIENTE' | 'ASIGNADO' | 'EN_ENTREGA' | 'ENTREGADO';
  transporteId?: string;
  fechaCreacion: string;
}

export interface Entrega {
  remitoId: string;
  nombreReceptor: string;
  firmaBase64: string;
  fotoBase64?: string;
  lat: number;
  lng: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
