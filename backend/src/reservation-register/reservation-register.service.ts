import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReservationRegisterDto } from './dto/create-reservation-register.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ReservationRegisterService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    { reservationId }: CreateReservationRegisterDto,
  ) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException(`Réservation ${reservationId} introuvable.`);
    }

    if (reservation.userId !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez effectuer le check-in que pour vos propres réservations.',
      );
    }

    const now = new Date();
    const start = new Date(reservation.startDate);
    const end = new Date(reservation.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (now < start || now > end) {
      throw new BadRequestException(
        'Le check-in ne peut être effectué que durant la période de réservation.',
      );
    }

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
