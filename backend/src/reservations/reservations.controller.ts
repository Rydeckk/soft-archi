import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('reservations')
export class ReservationsController {
  private readonly logger = new Logger(ReservationsController.name);

  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(@Body() createReservationDto: CreateReservationDto) {
    this.logger.log(
      `Request to create reservation for: ${createReservationDto.guestName}`,
    );
    return this.reservationsService.create(createReservationDto);
  }

  @Get()
  findAll() {
    this.logger.log('Request to get all reservations');
    return this.reservationsService.findAll();
  }
}
