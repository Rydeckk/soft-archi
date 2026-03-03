import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  SerializeOptions,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { GetUserPayload } from 'decorators/user.decorator';
import { ReservationEntity } from './entities/reservation.entity';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @SerializeOptions({ type: ReservationEntity })
  async create(
    @GetUserPayload('id') userId: string,
    @Body() createReservationDto: CreateReservationDto,
  ) {
    return this.reservationsService.create(userId, createReservationDto);
  }

  @Get()
  @SerializeOptions({ type: ReservationEntity })
  async findAll(@GetUserPayload('id') userId: string) {
    return this.reservationsService.findAll(userId);
  }

  @Patch(':id')
  @SerializeOptions({ type: ReservationEntity })
  async update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, updateReservationDto);
  }

  @Delete(':id')
  @SerializeOptions({ type: ReservationEntity })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.remove(id);
  }
}
