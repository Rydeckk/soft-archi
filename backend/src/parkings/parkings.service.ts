import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UpdateParkingDto } from './dto/update-parking.dto';

@Injectable()
export class ParkingsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.parking.findMany({
      orderBy: [{ code: 'asc' }, { number: 'asc' }],
    });
  }

  async update(id: string, data: UpdateParkingDto) {
    return this.prisma.parking.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.parking.delete({ where: { id } });
  }
}
