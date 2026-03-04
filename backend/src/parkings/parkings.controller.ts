import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  SerializeOptions,
} from '@nestjs/common';
import { ParkingsService } from './parkings.service';
import { ParkingEntity } from './entities/parking.entity';
import { UpdateParkingDto } from './dto/update-parking.dto';

@Controller('parkings')
export class ParkingsController {
  constructor(private readonly parkingsService: ParkingsService) {}

  @Get()
  @SerializeOptions({ type: ParkingEntity })
  findAll() {
    return this.parkingsService.findAll();
  }

  @Patch(':id')
  @SerializeOptions({ type: ParkingEntity })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateParkingDto: UpdateParkingDto,
  ) {
    return this.parkingsService.update(id, updateParkingDto);
  }

  @Delete(':id')
  @SerializeOptions({ type: ParkingEntity })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.parkingsService.remove(id);
  }
}
