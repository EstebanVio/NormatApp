import { AuthService } from '@/services/authService';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// Mocks
jest.mock('@prisma/client');
jest.mock('bcryptjs');

describe('AuthService', () => {
  let authService: AuthService;
  let prismaMock: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
      },
    } as any;

    authService = new AuthService(prismaMock);
  });

  describe('login', () => {
    it('should return tokens and user on successful login', async () => {
      const email = 'admin@remitos.local';
      const password = 'admin123';
      const hash = 'hashed_password';

      const mockUser = {
        id: '123',
        email,
        nombre: 'Admin',
        rol: 'ADMIN',
        passwordHash: hash,
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login(email, password);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(email);
    });

    it('should throw error on invalid email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login('invalid@remitos.local', 'password')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error on invalid password', async () => {
      const mockUser = {
        id: '123',
        email: 'admin@remitos.local',
        passwordHash: 'hash',
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login('admin@remitos.local', 'wrong')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should create new user with hashed password', async () => {
      const email = 'new@remitos.local';
      const password = 'password123';
      const hash = 'hashed_password';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hash);
      prismaMock.user.create.mockResolvedValue({
        id: '123',
        email,
        nombre: 'New User',
        rol: 'DRIVER',
        passwordHash: hash,
      } as any);

      const result = await authService.register(email, password, 'New User');

      expect(result.email).toBe(email);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(prismaMock.user.create).toHaveBeenCalled();
    });

    it('should throw error on duplicate email', async () => {
      const email = 'existing@remitos.local';

      prismaMock.user.findUnique.mockResolvedValue({} as any);

      await expect(
        authService.register(email, 'password', 'User')
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('refreshAccessToken', () => {
    it('should return new access token on valid refresh token', async () => {
      const refreshToken = 'valid_token';
      const mockUser = {
        id: '123',
        email: 'admin@remitos.local',
        role: 'ADMIN',
      };

      // Mock token verification
      const verifyResult = { userId: '123' };
      jest.spyOn(authService['jwt'], 'verify' as any).mockReturnValue(verifyResult);

      await expect(
        authService.refreshAccessToken(refreshToken)
      ).resolves.toBeDefined();
    });

    it('should throw error on invalid refresh token', async () => {
      await expect(
        authService.refreshAccessToken('invalid_token')
      ).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('changePassword', () => {
    it('should update password on valid old password', async () => {
      const userId = '123';
      const oldPassword = 'old123';
      const newPassword = 'new456';
      const hash = 'new_hash';

      const mockUser = {
        id: userId,
        passwordHash: 'old_hash',
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hash);

      await authService.changePassword(userId, oldPassword, newPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
    });

    it('should throw error on invalid old password', async () => {
      const mockUser = {
        passwordHash: 'hash',
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.changePassword('123', 'wrong', 'new')
      ).rejects.toThrow('Invalid current password');
    });
  });
});
