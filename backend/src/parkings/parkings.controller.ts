import { Controller, Get, SerializeOptions } from '@nestjs/common';
import { ParkingsService } from './parkings.service';
import { ParkingEntity } from './entities/parking.entity';

@Controller('parkings')
export class ParkingsController {
  constructor(private readonly parkingsService: ParkingsService) {}

  @Get()
  @SerializeOptions({ type: ParkingEntity })
  findAll() {
    return this.parkingsService.findAll();
  }
}
