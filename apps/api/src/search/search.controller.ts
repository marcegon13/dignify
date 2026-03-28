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
    const trimmed = query.trim();
    const semanticResults = await this.semanticService.searchBySentiment(trimmed);
    const normalResults = await this.searchService.searchMusic(trimmed);
    
    // Mezcla maestra: IA local + Potencia de Internet (YouTube)
    const seen = new Set(semanticResults.map(r => `${r.artist}-${r.title}`.toLowerCase()));
    const combined = [...semanticResults];
    
    for (const res of normalResults) {
      const key = `${res.artist}-${res.title}`.toLowerCase();
      if (!seen.has(key)) {
        combined.push(res);
        seen.add(key);
      }
    }

    return { data: combined };
  }
}
