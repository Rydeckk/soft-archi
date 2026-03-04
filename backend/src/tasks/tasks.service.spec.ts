import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from 'src/prisma.service';

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

const mockReservationToday = {
  id: 'res-today',
  startDate: new Date(TODAY),
  endDate: new Date(TODAY),
  userId: 'user-1',
  parkingId: 'park-1',
};

const mockPrisma = {
  reservation: {
    findMany: jest.fn(),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
  },
};

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('releaseUnconfirmedSpots()', () => {
    it('should delete reservations starting today without check-in', async () => {
      mockPrisma.reservation.findMany.mockResolvedValue([mockReservationToday]);

      await service.releaseUnconfirmedSpots();

      expect(mockPrisma.reservation.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['res-today'] } },
      });
    });

    it('should not delete anything when no unconfirmed reservations exist', async () => {
      mockPrisma.reservation.findMany.mockResolvedValue([]);

      await service.releaseUnconfirmedSpots();

      expect(mockPrisma.reservation.deleteMany).not.toHaveBeenCalled();
    });

    it('should query only reservations starting today (not past or future)', async () => {
      mockPrisma.reservation.findMany.mockResolvedValue([]);

      await service.releaseUnconfirmedSpots();

      const call = mockPrisma.reservation.findMany.mock.calls[0][0];
      const where = call.where;

      // startDate must have both gte (today start) and lte (today end)
      expect(where.startDate).toHaveProperty('gte');
      expect(where.startDate).toHaveProperty('lte');
      // Must not include endDate filter (which was the bug — it included past reservations)
      expect(where.endDate).toBeUndefined();
      expect(where.registers).toEqual({ none: {} });
    });

    it('should query only reservations without any check-in register', async () => {
      mockPrisma.reservation.findMany.mockResolvedValue([]);

      await service.releaseUnconfirmedSpots();

      const call = mockPrisma.reservation.findMany.mock.calls[0][0];
      expect(call.where.registers).toEqual({ none: {} });
    });
  });
});
