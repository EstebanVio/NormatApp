# React Admin Web

Panel de administración para el Sistema de Remitos Digitales.

## Características

-Crear y gestionar remitos
- Asignar remitos a transportes
- Ver estado y entregas en tiempo real
- Notificaciones vía WebSocket
- Dashboard con estadísticas
- Gestión de transportes

## Instalación

```bash
npm install
npm run dev
```

Accesible en `http://localhost:5173`

## Build

```bash
npm run build
```

Genera carpeta `dist/` lista para producción.

## Scripts

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Build para producción
- `npm run preview` - Preview del build
- `npm run lint` - Valida código
- `npm run format` - Formatea código
- `npm run type-check` - Valida tipos

## Estructura

```
src/
├── api/          # Endpoints de API
├── components/   # Componentes reutilizables
├── hooks/        # Hooks personalizados
├── pages/        # Páginas principales
├── store/        # Zustand stores
├── types/        # Tipos TypeScript
└── App.tsx       # Componente raíz
```

## Variables de entorno

```bash
VITE_API_URL=http://localhost:3000
```

## Credenciales de prueba

- Email: `admin@remitos.local`
- Contraseña: `admin123`
