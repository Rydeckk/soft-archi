import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

const mockUser = {
  id: 'user-1',
  name: 'Alice',
  email: 'alice@test.com',
  password: 'hashed-password',
  role: 'EMPLOYEE',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUsersService = {
  findUnique: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn().mockResolvedValue('jwt-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login()', () => {
    it('should return access token for valid credentials', async () => {
      mockUsersService.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login({
        email: 'alice@test.com',
        password: 'alice@test.com',
      });

      expect(result.accessToken).toBe('jwt-token');
      expect(result.user).toEqual(mockUser);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: 'user-1',
        role: 'EMPLOYEE',
      });
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      mockUsersService.findUnique.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'unknown@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      mockUsersService.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'alice@test.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser()', () => {
    it('should return user by JWT sub', async () => {
      mockUsersService.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser({ sub: 'user-1', role: 'EMPLOYEE' });

      expect(mockUsersService.findUnique).toHaveBeenCalledWith({ id: 'user-1' });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockUsersService.findUnique.mockResolvedValue(null);

      const result = await service.validateUser({ sub: 'nonexistent', role: 'EMPLOYEE' });

      expect(result).toBeNull();
    });
  });
});
