import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed: iniciando...');

  // Limpiar datos previos
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.entrega.deleteMany(),
    prisma.remito.deleteMany(),
    prisma.user.deleteMany(),
    prisma.transporte.deleteMany(),
  ]);

  // Crear transportes
  const transporte1 = await prisma.transporte.create({
    data: {
      nombre: 'Camión 001',
      activo: true,
    },
  });

  const transporte2 = await prisma.transporte.create({
    data: {
      nombre: 'Camión 002',
      activo: true,
    },
  });

  // Crear usuarios
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@remitos.local',
      name: 'Admin Local',
      passwordHash: await bcryptjs.hash('admin123', 10),
      role: 'ADMIN',
    },
  });

  const operatorUser = await prisma.user.create({
    data: {
      email: 'operador@remitos.local',
      name: 'Operador Local',
      passwordHash: await bcryptjs.hash('operator123', 10),
      role: 'OPERATOR',
    },
  });

  const driver1 = await prisma.user.create({
    data: {
      email: 'conductor1@remitos.local',
      name: 'Juan García',
      passwordHash: await bcryptjs.hash('driver123', 10),
      role: 'DRIVER',
      transporteId: transporte1.id,
    },
  });

  const driver2 = await prisma.user.create({
    data: {
      email: 'conductor2@remitos.local',
      name: 'María López',
      passwordHash: await bcryptjs.hash('driver123', 10),
      role: 'DRIVER',
      transporteId: transporte2.id,
    },
  });

  // Crear remitos de ejemplo
  const remito1 = await prisma.remito.create({
    data: {
      numero: 'REM-001-2024',
      cliente: 'Construcciones Díaz',
      direccion: 'Av. San Martín 1234, Córdoba',
      observaciones: 'Caja frágil, manejar con cuidado',
      estado: 'ASIGNADO',
      transporteId: transporte1.id,
    },
  });

  const remito2 = await prisma.remito.create({
    data: {
      numero: 'REM-002-2024',
      cliente: 'Empresa de Construcción Silva',
      direccion: 'Calle Rivadavia 567, La Calera',
      observaciones: 'Material para obra, confirmar entrega',
      estado: 'PENDIENTE',
    },
  });

  const remito3 = await prisma.remito.create({
    data: {
      numero: 'REM-003-2024',
      cliente: 'Depósito Central',
      direccion: 'Ruta Nacional 9 Km 50',
      observaciones: null,
      estado: 'ENTREGADO',
      transporteId: transporte1.id,
    },
  });

  // Crear una entrega de ejemplo
  await prisma.entrega.create({
    data: {
      remitoId: remito3.id,
      nombreReceptor: 'Pedro González',
      lat: -31.4201,
      lng: -64.1888,
      ipAddress: '192.168.1.100',
      userAgent: 'ExpoGo/1.0',
      usuarioId: driver1.id,
    },
  });

  // Crear registros de auditoría
  await prisma.auditLog.create({
    data: {
      usuarioId: adminUser.id,
      remitoId: remito1.id,
      accion: 'REMITO_ASIGNADO',
      metaJson: JSON.stringify({ transporteId: transporte1.id }),
    },
  });

  console.log('✅ Seed completado!');
  console.log('');
  console.log('Credenciales de prueba:');
  console.log('Admin:');
  console.log('  Email: admin@remitos.local');
  console.log('  Password: admin123');
  console.log('');
  console.log('Operador:');
  console.log('  Email: operador@remitos.local');
  console.log('  Password: operator123');
  console.log('');
  console.log('Conductor 1:');
  console.log('  Email: conductor1@remitos.local');
  console.log('  Password: driver123');
  console.log('');
  console.log('Conductor 2:');
  console.log('  Email: conductor2@remitos.local');
  console.log('  Password: driver123');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
