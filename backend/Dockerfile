# Dockerfile para Backend

FROM node:18-alpine

WORKDIR /app

# Instalar OpenSSL para Prisma
RUN apk add --no-cache openssl

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (incluir dev para TypeScript)
RUN npm ci && \
    npm install -g prisma

# Copiar archivos de Prisma
COPY prisma ./prisma/

# Generar cliente de Prisma
RUN npx prisma generate

# Copiar código fuente
COPY src ./src/
COPY tsconfig.json ./

# Compilar TypeScript
RUN npm run build

# Crear directorio de uploads
RUN mkdir -p uploads

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 3000

CMD ["npm", "start"]
