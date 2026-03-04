import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ParkingsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.parking.findMany({
      orderBy: [
        {
          code: 'asc',
        },
        {
          number: 'asc',
        },
      ],
    });
  }
}
