import { Controller, Get, Post, Delete, Body, Param, ForbiddenException, NotFoundException, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaService } from '../common/prisma.service';
import { StorageService } from '../common/storage.service';
import { TrackStatus } from '@dignify/database';

import { StreamingService } from './streaming.service';

@Controller('tracks')
export class TracksController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly streaming: StreamingService
  ) { }

  @Get('artist/:email')
  async getArtistTracks(@Param('email') email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { data: [] };

    const tracks = await this.prisma.track.findMany({
      where: {
        discovererId: user.id
      },
      include: {
        artist: true,
        sources: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    const formatted = tracks.map((trk: any) => ({
      id: trk.sources?.[0]?.url || trk.id,
      internalTrackId: trk.id,
      artist: trk.artist.name,
      title: trk.title,
      duration: trk.duration ?? undefined,
      thumbnailUrl: trk.thumbnailUrl ?? undefined,
      genre: trk.genre || 'OTHER',
      status: trk.status
    }));

    return { data: formatted };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadTrack(
    @UploadedFile() file: any,
    @Body() dto: { title: string; genre: string; userEmail: string; coverUrl?: string; cause?: string }
  ) {
    const track = await this.streaming.processUpload(file, dto);
    return { data: track };
  }

  @Delete(':id')
  async deleteTrack(@Param('id') internalTrackId: string) {
    try {
      await this.prisma.source.deleteMany({
        where: { trackId: internalTrackId }
      });
      await this.prisma.track.delete({
        where: { id: internalTrackId }
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  @Post(':id/listen')
  async recordListen(@Param('id') id: string, @Body() dto: { userEmail?: string }) {
    if (!dto.userEmail) throw new BadRequestException("User email is required");

    const track = await this.prisma.track.findUnique({
      where: { id },
      include: { artist: true }
    });

    if (track && track.artist.isVerified) {
      await this.prisma.user.update({
        where: { email: dto.userEmail },
        data: { curationPoints: { increment: 10 } }
      });
      return { success: true, pointsAdded: 10 };
    }

    return { success: true, pointsAdded: 0 };
  }
}
