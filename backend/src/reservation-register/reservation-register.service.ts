import { Injectable } from '@nestjs/common';
import { CreateReservationRegisterDto } from './dto/create-reservation-register.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ReservationRegisterService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    { reservationId }: CreateReservationRegisterDto,
  ) {
    return this.prisma.reservationRegister.create({
      data: {
        reservationId,
        userId,
      },
      include: {
        reservation: true,
      },
    });
  }

  async findAll() {
    return this.prisma.reservationRegister.findMany({
      include: {
        reservation: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.reservationRegister.delete({
      where: {
        id,
      },
    });
  }
}
