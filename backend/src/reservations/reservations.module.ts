import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { PrismaService } from 'src/prisma.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RABBITMQ_CLIENT, RESERVATION_QUEUE } from './reservations.constants';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: RABBITMQ_CLIENT,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
          queue: RESERVATION_QUEUE,
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService, PrismaService],
})
export class ReservationsModule {}
