import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@dignify/database';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const url = process.env.DATABASE_URL || '';
    console.log('[PrismaService] Connecting with URL length:', url.length);
    const pool = new pg.Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);
    super({ adapter, log: ['error', 'warn'] });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
