import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('recommended')
export class RecommendedController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async getRecommended(@Query('email') email?: string) {
    const results = await this.searchService.getRecommended(email);
    return { data: results };
  }
}
