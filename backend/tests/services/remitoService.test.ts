import { RemitoService } from '@/services/remitoService';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client');

describe('RemitoService', () => {
  let remitoService: RemitoService;
  let prismaMock: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    prismaMock = {
      remito: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as any;

    remitoService = new RemitoService(prismaMock);
  });

  describe('createRemito', () => {
    it('should create remito with valid data', async () => {
      const remitoData = {
        numero: 'REM-001',
        cliente: 'Cliente Test',
        direccion: 'Calle 1 123',
        observaciones: 'Test',
      };

      prismaMock.remito.create.mockResolvedValue({
        id: '123',
        ...remitoData,
        estado: 'PENDIENTE',
        createdAt: new Date(),
      } as any);

      const result = await remitoService.createRemito(remitoData);

      expect(result.numero).toBe(remitoData.numero);
      expect(result.estado).toBe('PENDIENTE');
    });

    it('should throw error on duplicate numero', async () => {
      const remitoData = {
        numero: 'REM-DUP',
        cliente: 'Cliente',
        direccion: 'Calle 1',
      };

      prismaMock.remito.findUnique.mockResolvedValue({} as any);

      await expect(
        remitoService.createRemito(remitoData)
      ).rejects.toThrow('Remito number already exists');
    });
  });

  describe('getRemito', () => {
    it('should return remito with given id', async () => {
      const remitoId = 'rem-123';
      const mockRemito = {
        id: remitoId,
        numero: 'REM-001',
        estado: 'PENDIENTE',
      };

      prismaMock.remito.findUnique.mockResolvedValue(mockRemito as any);

      const result = await remitoService.getRemito(remitoId);

      expect(result.id).toBe(remitoId);
      expect(prismaMock.remito.findUnique).toHaveBeenCalledWith({
        where: { id: remitoId },
      });
    });

    it('should return null if remito not found', async () => {
      prismaMock.remito.findUnique.mockResolvedValue(null);

      const result = await remitoService.getRemito('invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('assignRemito', () => {
    it('should change remito estado to ASIGNADO', async () => {
      const remitoId = 'rem-123';
      const transporteId = 'trans-123';

      prismaMock.remito.update.mockResolvedValue({
        id: remitoId,
        estado: 'ASIGNADO',
        transporteId,
      } as any);

      const result = await remitoService.assignRemito(remitoId, transporteId);

      expect(result.estado).toBe('ASIGNADO');
      expect(result.transporteId).toBe(transporteId);
    });

    it('should throw error if remito not in PENDIENTE estado', async () => {
      const mockRemito = {
        id: 'rem-123',
        estado: 'ASIGNADO',
      };

      prismaMock.remito.findUnique.mockResolvedValue(mockRemito as any);

      await expect(
        remitoService.assignRemito('rem-123', 'trans-123')
      ).rejects.toThrow('Remito must be in PENDIENTE status');
    });
  });

  describe('listRemitos', () => {
    it('should list remitos with pagination', async () => {
      const mockRemitos = [
        { id: '1', numero: 'REM-001', estado: 'PENDIENTE' },
        { id: '2', numero: 'REM-002', estado: 'ASIGNADO' },
      ];

      prismaMock.remito.findMany.mockResolvedValue(mockRemitos as any);

      const result = await remitoService.listRemitos({ page: 1, limit: 10 });

      expect(result).toHaveLength(2);
      expect(prismaMock.remito.findMany).toHaveBeenCalled();
    });

    it('should filter by estado', async () => {
      const mockRemitos = [
        { id: '1', numero: 'REM-001', estado: 'PENDIENTE' },
      ];

      prismaMock.remito.findMany.mockResolvedValue(mockRemitos as any);

      await remitoService.listRemitos({ estado: 'PENDIENTE' });

      expect(prismaMock.remito.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ estado: 'PENDIENTE' }),
        })
      );
    });
  });

  describe('updateRemitoEstado', () => {
    it('should update estado to valid next state', async () => {
      const remitoId = 'rem-123';

      prismaMock.remito.update.mockResolvedValue({
        id: remitoId,
        estado: 'EN_ENTREGA',
      } as any);

      const result = await remitoService.updateRemitoEstado(
        remitoId,
        'EN_ENTREGA'
      );

      expect(result.estado).toBe('EN_ENTREGA');
    });

    it('should reject invalid estado transitions', async () => {
      const mockRemito = {
        id: 'rem-123',
        estado: 'ENTREGADO',
      };

      prismaMock.remito.findUnique.mockResolvedValue(mockRemito as any);

      await expect(
        remitoService.updateRemitoEstado('rem-123', 'PENDIENTE')
      ).rejects.toThrow('Invalid state transition');
    });
  });

  describe('deleteRemito', () => {
    it('should delete remito in PENDIENTE estado only', async () => {
      const remitoId = 'rem-123';

      prismaMock.remito.findUnique.mockResolvedValue({
        id: remitoId,
        estado: 'PENDIENTE',
      } as any);

      prismaMock.remito.delete.mockResolvedValue({} as any);

      await remitoService.deleteRemito(remitoId);

      expect(prismaMock.remito.delete).toHaveBeenCalledWith({
        where: { id: remitoId },
      });
    });

    it('should throw error if remito not in PENDIENTE', async () => {
      const mockRemito = {
        id: 'rem-123',
        estado: 'ASIGNADO',
      };

      prismaMock.remito.findUnique.mockResolvedValue(mockRemito as any);

      await expect(
        remitoService.deleteRemito('rem-123')
      ).rejects.toThrow('Can only delete PENDIENTE remitos');
    });
  });
});
