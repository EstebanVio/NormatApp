# Backend - Sistema de Remitos Digitales

Backend API RESTful con WebSockets en tiempo real para el sistema de remitos digitales.

## Tecnologías
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Real-time**: Socket.IO
- **Autenticación**: JWT
- **Storage**: Amazon S3 (o local)

## Instalación

### Requisitos previos
- Node.js 18+
- PostgreSQL 14+
- PostgreSQL client tools

### Setup local
1. Crear archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

2. Configurar variables de entorno (ajustar según tu setup):
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/remitos_db"
JWT_SECRET="dev-secret-change-this"
NODE_ENV="development"
STORAGE_TYPE="local"
```

3. Instalar dependencias:
```bash
npm install
```

4. Ejecutar migraciones:
```bash
npm run migrate:dev
```

5. Ejecutar seed con datos de prueba:
```bash
npm run seed
```

6. Iniciar servidor en desarrollo:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## Scripts disponibles

- `npm run dev` - Inicia servidor en modo desarrollo (con hot reload)
- `npm run build` - Compila TypeScript a JavaScript
- `npm start` - Ejecuta servidor compilado (producción)
- `npm run migrate:dev` - Ejecuta migraciones en desarrollo (interactivo)
- `npm run migrate` - Aplica todas las migraciones pendientes
- `npm run seed` - Ejecuta script de seed
- `npm test` - Ejecuta tests
- `npm run test:coverage` - Tests con reporte de cobertura
- `npm run lint` - Valida código con ESLint
- `npm run lint:fix` - Corrige problemas de lint automáticamente
- `npm run format` - Formatea código con Prettier

## Estructura del proyecto

```
src/
├── controllers/      # Controladores de rutas
├── middleware/       # Middleware (autenticación, errores, etc)
├── routes/          # Definición de rutas API
├── services/        # Lógica de negocio
├── types/           # Tipos TypeScript
├── utils/           # Utilidades (JWT, storage, logger)
└── index.ts         # Entry point

prisma/
├── schema.prisma    # Esquema de BD
├── seed.ts          # Script de seed
└── migrations/      # Historial de migraciones
```

## Credenciales de prueba (después del seed)

**Admin:**
- Email: `admin@remitos.local`
- Password: `admin123`

**Operador:**
- Email: `operador@remitos.local`
- Password: `operator123`

**Conductor 1:**
- Email: `conductor1@remitos.local`
- Password: `driver123`

**Conductor 2:**
- Email: `conductor2@remitos.local`
- Password: `driver123`

## API Endpoints principales

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Login (retorna tokens)
- `POST /api/auth/refresh` - Refrescar access token
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/change-password` - Cambiar contraseña

### Remitos
- `POST /api/remitos` - Crear remito (requiere admin/operador)
- `GET /api/remitos` - Listar remitos con filtros
- `GET /api/remitos/:id` - Obtener detalles de remito
- `POST /api/remitos/:id/assign` - Asignar a transporte
- `DELETE /api/remitos/:id` - Eliminar remito (requiere admin)

### Entregas
- `POST /api/entregas` - Registrar entrega (requiere conductor)
- `GET /api/entregas/remito/:remitoId` - Obtener entregas de un remito
- `GET /api/entregas/mi-conductor` - Entregas del conductor autenticado
- `GET /api/entregas/:id` - Detalles de una entrega

### Transportes
- `POST /api/transportes` - Crear transporte (requiere admin)
- `GET /api/transportes` - Listar transportes activos
- `GET /api/transportes/:id` - Obtener detalles
- `PUT /api/transportes/:id` - Actualizar transporte
- `DELETE /api/transportes/:id` - Eliminar transporte
- `POST /api/transportes/asignar-conductor` - Asignar conductor

### Usuarios
- `POST /api/users` - Crear usuario (requiere admin)
- `GET /api/users` - Listar usuarios (requiere admin)
- `GET /api/users/:id` - Obtener detalles usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario
- `POST /api/users/:id/cambiar-rol` - Cambiar rol

## WebSockets (Socket.IO)

El servidor emite eventos en tiempo real:

### Eventos para Admin/Operador
- `notification:remito_assigned` - Nuevo remito asignado
- `notification:remito_delivered` - Remito entregado
- `notification:driver_online` - Conductor conectado
- `notification:driver_location` - Ubicación del conductor

### Eventos para Conductores
- `notification:delivery_confirmed` - Entrega confirmada

## Autenticación

### Flujo JWT
1. Login retorna `accessToken` (24h) y `refreshToken` (7 días)
2. Incluir `Authorization: Bearer <accessToken>` en headers
3. Si expire, usar `refreshToken` para obtener nuevo `accessToken`
4. Para WebSocket, pasar token en `socket.handshake.auth.token`

### Roles
- `ADMIN` - Acceso total
- `OPERATOR` - Crear/asignar remitos
- `DRIVER` - Entregar remitos

## Storage de archivos

### Local
Por defecto se guardan en `./uploads` (ver `STORAGE_TYPE=local`).
Accesibles en `http://localhost:3000/uploads/<path>`

### S3 / Compatible
Configurar:
```
STORAGE_TYPE="s3"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="remitos-storage"
```

## Docker

### Build de imagen
```bash
docker build -t remitos-backend:latest .
```

### Ejecutar contenedor
```bash
docker run -p 3000:3000 \
  --env-file .env \
  remitos-backend:latest
```

Ver `../docker-compose.yml` para setup completo con PostgreSQL.

## Desarrollo

### Agregar nueva ruta
1. Crear controlador en `src/controllers/`
2. Crear rutas en `src/routes/`
3. Importar en `src/index.ts`
4. Escribir tests en `tests/`

### Agregar nueva entidad en BD
1. Actualizar `prisma/schema.prisma`
2. Crear migración: `npm run migrate:dev`
3. Actualizar servicios

## Testing

```bash
npm test                  # Ejecutar tests
npm run test:coverage     # Con reporte de cobertura
npm run test:watch       # Modo watch
```

Objetivo: >= 70% cobertura en lógica crítica

## Variables de entorno

Ver `.env.example` para lista completa. Principales:

| Variable | Valor | Desc |
|----------|-------|------|
| `NODE_ENV` | `development`\|`production` | Ambiente |
| `DATABASE_URL` | PostgreSQL URL | Conexión BD |
| `JWT_SECRET` | string | Clave JWT |
| `PORT` | 3000 | Puerto servidor |
| `STORAGE_TYPE` | `local`\|`s3` | Tipo almacenamiento |
| `CORS_ORIGIN` | URLs | CORS permitidos |

## Logs

Winston logger con salida a:
- **Console**: Desarrollo (coloreado)
- **Archivo**: Producción (`error.log`, `combined.log`)

Formato JSON estructurado.

## Rate limiting

Por defecto: 100 req/min por IP. Configurable con:
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX_REQUESTS`

Deshabilitado en desarrollo.

## Health check

```bash
curl http://localhost:3000/health
# -> { "status": "ok", "timestamp": "2024-03-05T..." }
```

## Troubleshooting

### Error de conexión a BD
- Verificar PostgreSQL está corriendo
- Confirmar `DATABASE_URL` correcto
- Verificar credenciales

### Error de JWT
- Cambiar `JWT_SECRET` y `JWT_REFRESH_SECRET` en `.env`
- Asegurar tokens no están expirados

### Error de almacenamiento
- Si `STORAGE_TYPE=local`: asegurar permisos en `./uploads`
- Si `STORAGE_TYPE=s3`: verificar credenciales AWS

## Producción

Ver documentación de deploy en `/docs/DEPLOY.md`

### Checklist
- [ ] `NODE_ENV=production`
- [ ] Variables de entorno configuradas
- [ ] BD con backups configurados
- [ ] HTTPS/SSL habilitado
- [ ] Logs centralizados
- [ ] Health checks configurados
- [ ] Escala de replicas de backend
- [ ] Monitoreo activo

## Licencia

Proyecto SaaS - Derechos reservados
