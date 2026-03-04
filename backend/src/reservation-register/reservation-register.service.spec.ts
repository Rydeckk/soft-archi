import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ReservationRegisterService } from './reservation-register.service';
import { PrismaService } from 'src/prisma.service';

const TODAY = new Date();
const YESTERDAY = new Date(TODAY);
YESTERDAY.setDate(YESTERDAY.getDate() - 1);
const TOMORROW = new Date(TODAY);
TOMORROW.setDate(TOMORROW.getDate() + 1);
const PAST_DATE = new Date('2020-01-01');
const FUTURE_DATE = new Date('2030-12-31');

const makeReservation = (userId: string, start: Date, end: Date) => ({
  id: 'res-1',
  userId,
  parkingId: 'park-1',
  startDate: start,
  endDate: end,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const mockPrisma = {
  reservation: {
    findUnique: jest.fn(),
  },
  reservationRegister: {
    create: jest.fn().mockResolvedValue({ id: 'reg-1', reservationId: 'res-1', userId: 'user-1', reservation: {} }),
    findMany: jest.fn().mockResolvedValue([]),
    delete: jest.fn().mockResolvedValue({ id: 'reg-1' }),
  },
};

describe('ReservationRegisterService', () => {
  let service: ReservationRegisterService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationRegisterService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ReservationRegisterService>(ReservationRegisterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should create a check-in for a valid reservation', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(
        makeReservation('user-1', YESTERDAY, TOMORROW),
      );

      const result = await service.create('user-1', { reservationId: 'res-1' });

      expect(mockPrisma.reservationRegister.create).toHaveBeenCalledTimes(1);
      expect(result.id).toBe('reg-1');
    });

    it('should throw NotFoundException when reservation does not exist', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(null);

      await expect(
        service.create('user-1', { reservationId: 'nonexistent' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.reservationRegister.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when userId does not match reservation owner', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(
        makeReservation('user-2', YESTERDAY, TOMORROW),
      );

      await expect(
        service.create('user-1', { reservationId: 'res-1' }),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.reservationRegister.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when check-in is before reservation start', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(
        makeReservation('user-1', TOMORROW, FUTURE_DATE),
      );

      await expect(
        service.create('user-1', { reservationId: 'res-1' }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.reservationRegister.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when check-in is after reservation end', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(
        makeReservation('user-1', PAST_DATE, YESTERDAY),
      );

      await expect(
        service.create('user-1', { reservationId: 'res-1' }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.reservationRegister.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll()', () => {
    it('should return all check-ins', async () => {
      const result = await service.findAll();
      expect(mockPrisma.reservationRegister.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe('remove()', () => {
    it('should delete a check-in by id', async () => {
      const result = await service.remove('reg-1');
      expect(mockPrisma.reservationRegister.delete).toHaveBeenCalledWith({
        where: { id: 'reg-1' },
      });
      expect(result).toEqual({ id: 'reg-1' });
    });
  });
});
