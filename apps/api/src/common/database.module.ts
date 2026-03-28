import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SeedService } from './seed.service';
import { S3Service } from './s3.service';
import { StorageService } from './storage.service';

@Global()
@Module({
  providers: [PrismaService, SeedService, S3Service, StorageService],
  exports: [PrismaService, S3Service, StorageService],
})
export class DatabaseModule {}
