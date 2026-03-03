import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createReservationDto: CreateReservationDto) {
    this.logger.log(
      `Creating reservation for ${createReservationDto.guestName} from ${createReservationDto.start} to ${createReservationDto.end}`,
    );
    const reservation = await this.prisma.reservation.create({
      data: {
        guestName: createReservationDto.guestName,
        start: new Date(createReservationDto.start),
        end: new Date(createReservationDto.end),
      },
    });
    this.logger.log(`Reservation created with ID: ${reservation.id}`);
    return reservation;
  }

  async findAll() {
    this.logger.log('Fetching all reservations from DB...');
    const reservations = await this.prisma.reservation.findMany();
    this.logger.log(`Found ${reservations.length} reservations.`);
    return reservations;
  }
}
