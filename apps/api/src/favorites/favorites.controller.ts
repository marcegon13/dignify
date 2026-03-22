import { Controller, Post, Body, BadRequestException, Get, Param } from '@nestjs/common';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  async toggleFavorite(@Body() body: { email: string; trackId: string }) {
    if (!body.email || !body.trackId) {
      throw new BadRequestException('email y trackId son requeridos');
    }
    return this.favoritesService.toggleFavorite(body.email, body.trackId);
  }

  @Get(':email')
  async getFavorites(@Param('email') email: string) {
    return { data: await this.favoritesService.getUserFavorites(email) };
  }
}
