import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async toggleFavorite(email: string, trackId: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { status: 'error', message: 'User not found' };

    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_trackId: {
          userId: user.id,
          trackId,
        },
      },
    });

    if (existing) {
      await this.prisma.favorite.delete({
        where: { id: existing.id },
      });
      return { status: 'removed', trackId };
    } else {
      const count = await this.prisma.favorite.count({ where: { trackId } });
      const isFirstDiscovery = count === 0;

      await (this.prisma.favorite as any).create({
        data: {
          userId: user.id,
          trackId,
          isFirstDiscovery
        },
      });

      // Sumar 10 puntos de Curation per Like
      await (this.prisma.user as any).update({
        where: { id: user.id },
        data: { curationPoints: { increment: 10 } }
      });

      const track = await this.prisma.track.findUnique({ where: { id: trackId } });
      if (track && !track.discovererId) {
        await this.prisma.track.update({
          where: { id: trackId },
          data: { discovererId: user.id }
        });
      }

      return { status: 'added', trackId, isFirstDiscovery };
    }
  }

  async getUserFavorites(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return [];

    const favorites = await this.prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        track: {
          include: { artist: true, sources: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return favorites.map(f => ({
         id: f.track.sources[0]?.providerId || f.track.id.toString(),
         internalTrackId: f.track.id,
         artist: f.track.artist.name,
         title: f.track.title,
         duration: f.track.duration || undefined,
         thumbnailUrl: f.track.thumbnailUrl || undefined,
         sources: f.track.sources.map((src: any) => ({
           provider: src.provider,
           url: src.url,
           isOfficial: src.isOfficial
         }))
    }));
  }
}

