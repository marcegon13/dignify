import { Controller, Post, Body, Param, BadRequestException, Get } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post()
  async createPlaylist(@Body() body: { email: string; name: string; description?: string }) {
    if (!body.email || !body.name) {
      throw new BadRequestException('email and name are required');
    }
    return this.playlistsService.createPlaylist(body.email, body.name, body.description);
  }

  @Post(':id/add-track')
  async addTrack(
    @Param('id') playlistId: string, 
    @Body() body: { trackId: string; email: string }
  ) {
    if (!body.trackId || !body.email) {
      throw new BadRequestException('trackId and email are required');
    }
    return this.playlistsService.addTrackToPlaylist(playlistId, body.trackId, body.email);
  }

  @Get(':email')
  async getPlaylists(@Param('email') email: string) {
    return { data: await this.playlistsService.getUserPlaylists(email) };
  }
}
