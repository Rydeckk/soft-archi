import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { SpotsService } from './spots.service';
import { CreateSpotDto } from './dto/create-spot.dto';

@Controller('spots')
export class SpotsController {
  private readonly logger = new Logger(SpotsController.name);

  constructor(private readonly spotsService: SpotsService) {}

  @Post()
  create(@Body() createSpotDto: CreateSpotDto) {
    this.logger.log(`Request to create spot: ${createSpotDto.number}`);
    return this.spotsService.create(createSpotDto);
  }

  @Get()
  findAll() {
    this.logger.log('Request to get all spots');
    return this.spotsService.findAll();
  }
}
