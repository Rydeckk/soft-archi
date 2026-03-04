import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma.service';
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

const mockPrisma = {
  user: {
    findMany: jest.fn().mockResolvedValue([mockUser]),
    findUnique: jest.fn().mockResolvedValue(mockUser),
    create: jest.fn().mockResolvedValue(mockUser),
    delete: jest.fn().mockResolvedValue(mockUser),
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    it('should return users matching the where clause', async () => {
      const result = await service.findAll({});
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findUnique()', () => {
    it('should return a user by id', async () => {
      const result = await service.findUnique({ id: 'user-1' });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(result).toEqual(mockUser);
    });

    it('should return a user by email', async () => {
      const result = await service.findUnique({ email: 'alice@test.com' });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'alice@test.com' },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('create()', () => {
    it('should hash the password before saving', async () => {
      const hashSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed' as never);

      await service.create({
        name: 'Bob',
        email: 'bob@test.com',
        password: 'plain-password',
        role: 'EMPLOYEE' as any,
      });

      expect(hashSpy).toHaveBeenCalledWith('plain-password', 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ password: 'hashed' }),
      });
    });

    it('should not store the plain text password', async () => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed' as never);

      await service.create({
        name: 'Bob',
        email: 'bob@test.com',
        password: 'plain-password',
        role: 'EMPLOYEE' as any,
      });

      const createCall = mockPrisma.user.create.mock.calls[0][0];
      expect(createCall.data.password).not.toBe('plain-password');
    });
  });

  describe('deleteOne()', () => {
    it('should delete a user by id', async () => {
      const result = await service.deleteOne('user-1');
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(result).toEqual(mockUser);
    });
  });
});
