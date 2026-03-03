import { Test, TestingModule } from '@nestjs/testing';
import { ReservationRegisterController } from './reservation-register.controller';
import { ReservationRegisterService } from './reservation-register.service';

describe('ReservationRegisterController', () => {
  let controller: ReservationRegisterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationRegisterController],
      providers: [ReservationRegisterService],
    }).compile();

    controller = module.get<ReservationRegisterController>(
      ReservationRegisterController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
