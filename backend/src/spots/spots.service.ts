import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateSpotDto } from './dto/create-spot.dto';

@Injectable()
export class SpotsService {
  private readonly logger = new Logger(SpotsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createSpotDto: CreateSpotDto) {
    this.logger.log(`Creating spot with number: ${createSpotDto.number}`);
    const spot = await this.prisma.spot.create({
      data: {
        number: createSpotDto.number,
      },
    });
    this.logger.log(`Spot created with ID: ${spot.id}`);
    return spot;
  }

  async findAll() {
    this.logger.log('Fetching all spots...');
    const spots = await this.prisma.spot.findMany({
      orderBy: { number: 'asc' },
    });
    this.logger.log(`Found ${spots.length} spots.`);
    return spots;
  }
}
