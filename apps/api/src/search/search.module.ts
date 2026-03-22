import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SourcesModule } from '../sources/sources.module';
import { MetadataModule } from '../metadata/metadata.module';
import { RecommendedController } from './recommended.controller';
import { SemanticSearchService } from './semantic.service';

@Module({
  imports: [SourcesModule, MetadataModule],
  controllers: [SearchController, RecommendedController],
  providers: [SearchService, SemanticSearchService],
})
export class SearchModule {}
