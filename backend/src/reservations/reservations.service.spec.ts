import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { PrismaService } from 'src/prisma.service';
import { RABBITMQ_CLIENT } from './reservations.constants';
import { UserRole } from 'generated/prisma/enums';

const mockReservation = {
  id: 'res-1',
  userId: 'user-1',
  parkingId: 'park-1',
  startDate: new Date('2026-03-10'),
  endDate: new Date('2026-03-12'),
  createdAt: new Date(),
  updatedAt: new Date(),
  user: { id: 'user-1', name: 'Alice', email: 'alice@test.com' },
  parking: { id: 'park-1', code: 'A', number: '01' },
};

const mockPrisma = {
  reservation: {
    create: jest.fn().mockResolvedValue(mockReservation),
    findMany: jest.fn().mockResolvedValue([mockReservation]),
    update: jest.fn().mockResolvedValue(mockReservation),
    delete: jest.fn().mockResolvedValue(mockReservation),
  },
};

const mockRabbitClient = {
  emit: jest.fn(),
};

describe('ReservationsService', () => {
  let service: ReservationsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RABBITMQ_CLIENT, useValue: mockRabbitClient },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should create a reservation and emit RabbitMQ event', async () => {
      const dto = {
        parkingId: 'park-1',
        startDate: new Date('2026-03-10'),
        endDate: new Date('2026-03-12'),
      };

      const result = await service.create('user-1', UserRole.EMPLOYEE, dto);

      expect(mockPrisma.reservation.create).toHaveBeenCalledTimes(1);
      expect(mockRabbitClient.emit).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockReservation);
    });

    it('should throw BadRequestException when EMPLOYEE exceeds 5 business days', async () => {
      const dto = {
        parkingId: 'park-1',
        // Mon to next Mon = 6 business days
        startDate: new Date('2026-03-09'),
        endDate: new Date('2026-03-16'),
      };

      await expect(
        service.create('user-1', UserRole.EMPLOYEE, dto),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.reservation.create).not.toHaveBeenCalled();
    });

    it('should allow EMPLOYEE with exactly 5 business days', async () => {
      const dto = {
        parkingId: 'park-1',
        // Mon to Fri = 5 business days
        startDate: new Date('2026-03-09'),
        endDate: new Date('2026-03-13'),
      };

      await expect(
        service.create('user-1', UserRole.EMPLOYEE, dto),
      ).resolves.toBeDefined();
    });

    it('should throw BadRequestException when MANAGER exceeds 30 calendar days', async () => {
      const dto = {
        parkingId: 'park-1',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-04-02'), // 33 days
      };

      await expect(
        service.create('user-1', UserRole.MANAGER, dto),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.reservation.create).not.toHaveBeenCalled();
    });

    it('should allow MANAGER with exactly 30 calendar days', async () => {
      const dto = {
        parkingId: 'park-1',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-30'), // 30 days
      };

      await expect(
        service.create('user-1', UserRole.MANAGER, dto),
      ).resolves.toBeDefined();
    });

    it('should apply employee rules for SECRETARY role', async () => {
      const dto = {
        parkingId: 'park-1',
        startDate: new Date('2026-03-09'),
        endDate: new Date('2026-03-16'), // 6 business days
      };

      await expect(
        service.create('user-1', UserRole.SECRETARY, dto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll()', () => {
    it('should return all reservations', async () => {
      const result = await service.findAll();
      expect(mockPrisma.reservation.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockReservation]);
    });
  });

  describe('update()', () => {
    it('should update a reservation', async () => {
      const result = await service.update('res-1', { parkingId: 'park-2' });
      expect(mockPrisma.reservation.update).toHaveBeenCalledWith({
        where: { id: 'res-1' },
        data: { parkingId: 'park-2' },
      });
      expect(result).toEqual(mockReservation);
    });
  });

  describe('remove()', () => {
    it('should delete a reservation', async () => {
      const result = await service.remove('res-1');
      expect(mockPrisma.reservation.delete).toHaveBeenCalledWith({
        where: { id: 'res-1' },
      });
      expect(result).toEqual(mockReservation);
    });
  });
});
