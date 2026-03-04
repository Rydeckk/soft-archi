import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwtGuard/jwtAuth.guard';
import { RolesGuard } from './auth/userGuard/roles.guard';
import { ReservationsModule } from './reservations/reservations.module';
import { ReservationRegisterModule } from './reservation-register/reservation-register.module';
import { ParkingsModule } from './parkings/parkings.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    ReservationsModule,
    ReservationRegisterModule,
    ParkingsModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    AppService,
  ],
})
export class AppModule {}
