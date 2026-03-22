import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class PlaylistsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPlaylist(email: string, name: string, description?: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.playlist.create({
      data: {
        name,
        description,
        userId: user.id,
      },
    });
  }

  async addTrackToPlaylist(playlistId: string, trackId: string, email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    
    const playlist = await this.prisma.playlist.findUnique({ where: { id: playlistId } });
    
    if (!playlist || playlist.userId !== user.id) {
      throw new NotFoundException('Playlist not found or you do not have permission.');
    }

    const exists = await this.prisma.playlistTrack.findUnique({
      where: {
        playlistId_trackId: { playlistId, trackId },
      },
    });

    if (exists) return { status: 'already_exists' };

    await this.prisma.playlistTrack.create({
      data: { playlistId, trackId },
    });

    return { status: 'added' };
  }

  async getUserPlaylists(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return [];
    return this.prisma.playlist.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
  }
}
