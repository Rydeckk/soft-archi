import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private prisma: PrismaService) {}

  @Cron('0 11 * * *')
  async releaseUnconfirmedSpots() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const unconfirmed = await this.prisma.reservation.findMany({
      where: {
        startDate: { gte: today, lte: todayEnd },
        registers: { none: {} },
      },
    });

    if (unconfirmed.length === 0) {
      this.logger.log('Cron 11h : aucune réservation non confirmée.');
      return;
    }

    await this.prisma.reservation.deleteMany({
      where: { id: { in: unconfirmed.map((r) => r.id) } },
    });

    this.logger.log(
      `Cron 11h : ${unconfirmed.length} réservation(s) non confirmée(s) supprimée(s).`,
    );
  }
}
