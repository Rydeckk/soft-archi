import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '../prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { CreateReservationDto } from './dto/create-reservation.dto';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a reservation', async () => {
      const createDto: CreateReservationDto = {
        guestName: 'John Doe',
        start: '2023-10-01T10:00:00.000Z',
        end: '2023-10-02T10:00:00.000Z',
      };

      const expectedResult = {
        id: 1,
        guestName: createDto.guestName,
        start: new Date(createDto.start),
        end: new Date(createDto.end),
        createdAt: new Date(),
      };

      prisma.reservation.create.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(prisma.reservation['create']).toHaveBeenCalledWith({
        data: {
          guestName: createDto.guestName,
          start: new Date(createDto.start),
          end: new Date(createDto.end),
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of reservations', async () => {
      const expectedResult = [
        {
          id: 1,
          guestName: 'John Doe',
          start: new Date(),
          end: new Date(),
          createdAt: new Date(),
        },
      ];

      prisma.reservation['findMany'].mockResolvedValue(expectedResult);

      const result = await service.findAll();

      expect(result).toEqual(expectedResult);
      expect(prisma.reservation['findMany']).toHaveBeenCalled();
    });
  });
});
