import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const isTestRuntime = process.env.NODE_ENV === 'test' || !!process.env.JEST_WORKER_ID;

    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }

    const sanitizedConnectionString = connectionString.replace(/([?&])sslmode=require(&?)/, (_, prefix, suffix) => {
      if (suffix) {
        return prefix;
      }

      return '';
    }).replace(/[?&]$/, '');

    const pool = new Pool({ connectionString: sanitizedConnectionString });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: isTestRuntime ? ['warn', 'error'] : ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}