import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PrismaService } from 'src/prisma.service';
import { RABBITMQ_CLIENT, RESERVATION_QUEUE } from './reservations.constants';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { UserRole } from 'generated/prisma/enums';

const MAX_BUSINESS_DAYS_EMPLOYEE = 5;
const MAX_CALENDAR_DAYS_MANAGER = 30;

function countBusinessDays(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);
  while (current <= endDay) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaService,
    @Inject(RABBITMQ_CLIENT) private readonly rabbitClient: ClientProxy,
  ) {}

  async create(userId: string, userRole: UserRole, data: CreateReservationDto) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (userRole === UserRole.MANAGER) {
      const diffDays = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;
      if (diffDays > MAX_CALENDAR_DAYS_MANAGER) {
        throw new BadRequestException(
          `Les managers ne peuvent pas réserver plus de ${MAX_CALENDAR_DAYS_MANAGER} jours calendaires.`,
        );
      }
    } else {
      const businessDays = countBusinessDays(start, end);
      if (businessDays > MAX_BUSINESS_DAYS_EMPLOYEE) {
        throw new BadRequestException(
          `Les employés ne peuvent pas réserver plus de ${MAX_BUSINESS_DAYS_EMPLOYEE} jours ouvrés.`,
        );
      }
    }

    const reservation = await this.prisma.reservation.create({
      data: { ...data, userId },
      include: { user: true, parking: true },
    });

    this.rabbitClient.emit(RESERVATION_QUEUE, {
      reservationId: reservation.id,
      userEmail: reservation.user.email,
      userName: reservation.user.name,
      parkingCode: `${reservation.parking.code}${reservation.parking.number}`,
      startDate: reservation.startDate.toISOString(),
      endDate: reservation.endDate.toISOString(),
      formattedStart: format(reservation.startDate, 'EEEE dd MMMM yyyy', {
        locale: fr,
      }),
      formattedEnd: format(reservation.endDate, 'EEEE dd MMMM yyyy', {
        locale: fr,
      }),
    });

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
