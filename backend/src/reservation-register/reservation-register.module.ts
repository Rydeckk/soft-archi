import { Module } from '@nestjs/common';
import { ReservationRegisterService } from './reservation-register.service';
import { ReservationRegisterController } from './reservation-register.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ReservationRegisterController],
  providers: [ReservationRegisterService, PrismaService],
})
export class ReservationRegisterModule {}
