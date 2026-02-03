import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();

    // Log SQL queries
    this.$on('query' as never, (e: any) => {
      this.logger.log(`[PRISMA] SQL Query: ${e.query}`);
      this.logger.log(`[PRISMA] Parameters: ${e.params}`);
    });

    this.$on('error' as never, (e: any) => {
      this.logger.error(`[PRISMA] Error: ${e.message}`);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
