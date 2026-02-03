import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { MessagesModule } from './messages/messages.module';
import { ReservationsModule } from './reservations/reservations.module';

@Module({
  imports: [ConfigModule.forRoot(), MessagesModule, ReservationsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
