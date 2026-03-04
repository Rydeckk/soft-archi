import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  SerializeOptions,
} from '@nestjs/common';
import { ReservationRegisterService } from './reservation-register.service';
import { CreateReservationRegisterDto } from './dto/create-reservation-register.dto';
import { GetUserPayload } from 'decorators/user.decorator';
import { ReservationRegisterEntity } from './entities/reservation-register.entity';

@Controller('reservation-register')
export class ReservationRegisterController {
  constructor(
    private readonly reservationRegisterService: ReservationRegisterService,
  ) {}

  @Post()
  @SerializeOptions({ type: ReservationRegisterEntity })
  create(
    @GetUserPayload('id') userId: string,
    @Body() createReservationRegisterDto: CreateReservationRegisterDto,
  ) {
    return this.reservationRegisterService.create(
      userId,
      createReservationRegisterDto,
    );
  }

  @Get()
  @SerializeOptions({ type: ReservationRegisterEntity })
  findAll() {
    return this.reservationRegisterService.findAll();
  }

  @Delete(':id')
  @SerializeOptions({ type: ReservationRegisterEntity })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationRegisterService.remove(id);
  }
}
