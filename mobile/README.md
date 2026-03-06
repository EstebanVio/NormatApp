# Mobile - Sistema de Remitos Digitales

Aplicación móvil con Expo (React Native) para conductores/transportistas.

## Características

- Login de transportista
- Lista de remitos asignados
- Ver detalles del remito
- Captura de firma en canvas
- Registro de GPS
- Foto opcional de entrega
- Almacenamiento offline
- Sincronización cuando conecta a red
- Notificaciones en tiempo real

## Instalación

```bash
npm install
npm start
```

Escanea QR con Expo Go en tu móvil.

## Desarrollo por plataforma

```bash
npm run android  # Android
npm run ios      # iOS
npm run web      # Web
```

## Build para producción

```bash
npm run build:android
npm run build:ios
```

## Estructura

```
src/
├── api/          # Endpoints
├── components/   # Componentes reutilizables
├── hooks/        # Hooks personalizados
├── screens/      # Pantallas principales
├── store/        # Zustand stores
├── types/        # Tipos
└── App.tsx       # Root component
```

## Permisos requeridos

- **Cámara**: Para capturar firma y foto de entrega
- **Localización**: Para registrar GPS de entrega
- **Almacenamiento**: Para fotos y datos offline

## Variables de entorno

Crear `.env`:
```bash
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## Testing de entregas

Credenciales conductor 1:
- Email: `conductor1@remitos.local`
- Contraseña: `driver123`

Tiene asignado Remito REM-001-2024 en desarrollo.

## Offline-first

La app guarda entregas localmente en AsyncStorage si no hay conexión y las sincroniza cuando vuelve online.

Indicador de sync en pantalla principal.
