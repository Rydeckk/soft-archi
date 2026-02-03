import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

describe('ReservationsController', () => {
  let controller: ReservationsController;

  const mockReservationsService = {
    create: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        {
          provide: ReservationsService,
          useValue: mockReservationsService,
        },
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a reservation', async () => {
      const createDto: CreateReservationDto = {
        guestName: 'Jane Doe',
        start: '2023-11-01T10:00:00.000Z',
        end: '2023-11-02T10:00:00.000Z',
      };

      const result = {
        id: 1,
        ...createDto,
        start: new Date(createDto.start),
        end: new Date(createDto.end),
        createdAt: new Date(),
      };

      mockReservationsService.create.mockResolvedValue(result);

      expect(await controller.create(createDto)).toBe(result);
      expect(mockReservationsService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of reservations', async () => {
      const result = [
        {
          id: 1,
          guestName: 'Jane Doe',
          start: new Date(),
          end: new Date(),
          createdAt: new Date(),
        },
      ];

      mockReservationsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(mockReservationsService.findAll).toHaveBeenCalled();
    });
  });
});
