import { Controller, Get, Post, Delete, Body, Param, ForbiddenException, NotFoundException, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaService } from '../common/prisma.service';
import { StorageService } from '../common/storage.service';
import { TrackStatus } from '@dignify/database';

@Controller('tracks')
export class TracksController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService
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

    const formatted = tracks.map((trk) => ({
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
    @UploadedFile() file: any, // Express.Multer.File if @types/multer is installed
    @Body() dto: { title: string; genre: string; userEmail: string; coverUrl?: string; cause?: string }
  ) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.userEmail } });
    if (!user) throw new NotFoundException("Usuario no encontrado.");

    if (user.role !== 'ARTIST') {
      throw new ForbiddenException("Solo los usuarios con rol de ARTISTA pueden cargar tracks.");
    }

    const userNameOrEmail = user.name || (user.email ? user.email.split('@')[0] : 'Unknown');
    let artist = await this.prisma.artist.findFirst({ where: { name: userNameOrEmail } });

    if (!artist) {
      artist = await this.prisma.artist.create({
        data: {
          name: userNameOrEmail,
          slug: userNameOrEmail.toLowerCase().replace(/\s+/g, '-'),
          isVerified: true
        }
      });
    }

    let fileUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"; 

    if (file) {
      fileUrl = await this.storage.uploadFile(file, 'audio');
    }

    const newTrack = await this.prisma.track.create({
      data: {
        title: dto.title,
        artistId: artist.id,
        discovererId: user.id,
        status: TrackStatus.PENDING,
        thumbnailUrl: dto.coverUrl || "https://images.unsplash.com/photo-1516280440502-86ed0ee20078?q=80&w=500&auto=format&fit=crop",
        duration: 0,
        cause: dto.cause || null,
        genre: dto.genre,
        sources: {
          create: {
            provider: 'DIGNIFY',
            providerId: fileUrl,
            url: fileUrl,
            isOfficial: true,
            quality: 'HD'
          }
        }
      }
    });

    return { data: newTrack };
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
