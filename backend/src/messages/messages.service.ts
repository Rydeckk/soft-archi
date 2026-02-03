import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(private prisma: PrismaService) {}

  async create(content: string) {
    this.logger.log(`[SERVICE] Creating message in database: "${content}"`);
    const result = await this.prisma.message.create({
      data: { content },
    });
    this.logger.log(`[SERVICE] Message saved with ID: ${result.id}`);
    return result;
  }

  async findAll() {
    this.logger.log('[SERVICE] Fetching all messages from database');
    const result = await this.prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
    });
    this.logger.log(
      `[SERVICE] Retrieved ${result.length} messages from database`,
    );
    return result;
  }
}
