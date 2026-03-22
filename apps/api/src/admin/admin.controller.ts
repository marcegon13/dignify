import { Controller, Get, Delete, Param, Patch, Body } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('stats')
  async getStats() {
    const totalUsers = await (this.prisma.user as any).count({ where: { role: 'USER' } });
    const totalArtists = await (this.prisma.user as any).count({ where: { role: 'ARTIST' } });
    const pointsData = await (this.prisma.user as any).aggregate({
      _sum: {
        curationPoints: true
      }
    });

    const totalReFiPoints = pointsData._sum.curationPoints || 0;

    const latestTracks = await this.prisma.track.findMany({
      take: 20,
      orderBy: { updatedAt: 'desc' },
      include: {
        artist: true,
        sources: true
      }
    });

    const formattedTracks = latestTracks.map((trk: any) => ({
      id: trk.sources?.[0]?.providerId || trk.id.toString(),
      internalTrackId: trk.id,
      title: trk.title,
      artist: trk.artist.name,
      thumbnailUrl: trk.thumbnailUrl,
      cause: trk.cause,
      status: trk.status,
      createdAt: trk.updatedAt
    }));

    return {
      data: {
        totalUsers,
        totalArtists,
        totalReFiPoints,
        latestTracks: formattedTracks
      }
    };
  }

  @Patch('tracks/:id/status')
  async updateTrackStatus(@Param('id') id: string, @Body() dto: { status: 'APPROVED' | 'REJECTED' }) {
    const updated = await (this.prisma.track as any).update({
      where: { id },
      data: { status: dto.status }
    });
    return { data: updated };
  }

  @Delete('tracks/:id')
  async deleteTrack(@Param('id') id: string) {
    // Primero borramos las fuentes vinculadas
    await this.prisma.source.deleteMany({
      where: { trackId: id }
    });
    
    await this.prisma.track.delete({
      where: { id }
    });
    return { success: true };
  }
}
