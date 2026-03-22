import { Module } from '@nestjs/common';
import { MetadataResolverService } from './metadata.service';

@Module({
  providers: [MetadataResolverService],
  exports: [MetadataResolverService],
})
export class MetadataModule {}
