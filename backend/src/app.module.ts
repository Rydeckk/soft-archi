import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [ConfigModule.forRoot(), MessagesModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
