import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createReservationDto: CreateReservationDto) {
    return await this.prisma.reservation.create({
      data: {
        guestName: createReservationDto.guestName,
        start: new Date(createReservationDto.start),
        end: new Date(createReservationDto.end),
      },
    });
  }

  async findAll() {
    return await this.prisma.reservation.findMany();
  }
}
