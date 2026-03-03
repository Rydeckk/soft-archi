import { Test, TestingModule } from '@nestjs/testing';
import { ReservationRegisterService } from './reservation-register.service';

describe('ReservationRegisterService', () => {
  let service: ReservationRegisterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReservationRegisterService],
    }).compile();

    service = module.get<ReservationRegisterService>(ReservationRegisterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
