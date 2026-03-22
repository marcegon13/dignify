import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { SearchService } from './search.service';
import { SemanticSearchService } from './semantic.service';

@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly semanticService: SemanticSearchService,
  ) {}

  @Get()
  async search(@Query('q') query: string) {
    if (!query) {
      throw new BadRequestException('Query parameter "q" is required');
    }
    const results = await this.searchService.searchMusic(query.trim());
    return { data: results };
  }

  @Get('semantic')
  async searchSemantic(@Query('q') query: string) {
    if (!query) {
      throw new BadRequestException('Query parameter "q" is required');
    }
    const results = await this.semanticService.searchBySentiment(query.trim());
    return { data: results };
  }
}
