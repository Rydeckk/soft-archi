import { Controller, Get, Post, Body, Logger } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  private readonly logger = new Logger(MessagesController.name);

  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(@Body('content') content: string) {
    this.logger.log(`[CONTROLLER] POST /messages - Creating message: "${content}"`);
    const result = await this.messagesService.create(content);
    this.logger.log(`[CONTROLLER] Message created with ID: ${result.id}`);
    return result;
  }

  @Get()
  async findAll() {
    this.logger.log('[CONTROLLER] GET /messages - Fetching all messages');
    const result = await this.messagesService.findAll();
    this.logger.log(`[CONTROLLER] Returning ${result.length} messages`);
    return result;
  }
}