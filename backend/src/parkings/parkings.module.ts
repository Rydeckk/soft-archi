import { Module } from '@nestjs/common';
import { ParkingsService } from './parkings.service';
import { ParkingsController } from './parkings.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ParkingsController],
  providers: [ParkingsService, PrismaService],
})
export class ParkingsModule {}
