import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PrismaService } from 'src/prisma.service';
import { RABBITMQ_CLIENT, RESERVATION_QUEUE } from './reservations.constants';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaService,
    @Inject(RABBITMQ_CLIENT) private readonly rabbitClient: ClientProxy,
  ) {}

  async create(userId: string, data: CreateReservationDto) {
    const reservation = await this.prisma.reservation.create({
      data: { ...data, userId },
      include: { user: true, parking: true },
    });

    // this.rabbitClient.emit(RESERVATION_QUEUE, {
    //   reservationId: reservation.id,
    //   userEmail: reservation.user.email,
    //   userName: reservation.user.name,
    //   parkingCode: `${reservation.parking.code}${reservation.parking.number}`,
    //   startDate: reservation.startDate.toISOString(),
    //   endDate: reservation.endDate.toISOString(),
    //   formattedStart: format(reservation.startDate, 'EEEE dd MMMM yyyy', {
    //     locale: fr,
    //   }),
    //   formattedEnd: format(reservation.endDate, 'EEEE dd MMMM yyyy', {
    //     locale: fr,
    //   }),
    // });

    return reservation;
  }

  async findAll() {
    return this.prisma.reservation.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: UpdateReservationDto) {
    return this.prisma.reservation.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.reservation.delete({ where: { id } });
  }
}
