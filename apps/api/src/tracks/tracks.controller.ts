import { Controller, Get, Post, Delete, Body, Param, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Controller('tracks')
export class TracksController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('artist/:email')
  async getArtistTracks(@Param('email') email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { data: [] };

    // Fetch tracks discovered by this user OR artist mapped tracks
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

    // Formatting them for TrackItem
    const formatted = tracks.map((trk: any) => ({
      id: trk.sources?.[0]?.providerId || trk.id.toString(),
      internalTrackId: trk.id,
      artist: trk.artist.name,
      title: trk.title,
      duration: trk.duration || undefined,
      thumbnailUrl: trk.thumbnailUrl || undefined,
      sources: trk.sources.map((src: any) => ({
        provider: src.provider,
        url: src.url,
        isOfficial: src.isOfficial
      }))
    }));

    return { data: formatted };
  }

  @Post('upload')
  async uploadTrack(@Body() dto: { title: string; genre: string; price?: number; userEmail: string; coverUrl?: string; cause?: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.userEmail } });
    if (!user) throw new NotFoundException("Usuario no encontrado.");

    if ((user as any).role !== 'ARTIST') {
      throw new ForbiddenException("Solo los usuarios con rol de ARTISTA pueden cargar tracks al portal.");
    }

    // Buscamos o creamos al artista vinculado a su nombre de usuario
    const userNameOrEmail = user.name || (user.email ? user.email.split('@')[0] : 'Unknown');
    
    // Verificamos si el usuario tiene redes vinculadas para marcarlo como verificado
    const hasSocialLinks = !!((user as any).spotifyLink || (user as any).youtubeLink);
    
    let artist = await this.prisma.artist.findFirst({ where: { name: userNameOrEmail }});
    if (!artist) {
      artist = await this.prisma.artist.create({
        data: { name: userNameOrEmail, isVerified: hasSocialLinks }
      });
    } else if (artist.isVerified !== hasSocialLinks) {
       // Actualizamos estado de verificación si cambió
       artist = await this.prisma.artist.update({
         where: { id: artist.id },
         data: { isVerified: hasSocialLinks }
       });
    }

    // Simulamos la URL del bucket tras la carga final del cliente
    // (Por ahora asignamos el mismo enlace genérico de mp3 para propósitos visuales)
    const mockFileUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";

    // HOOK TRUST & SAFETY: Verificación de Copyright (Simulada)
    const isCopyrightClear = await this.checkCopyright(dto.title, userNameOrEmail);
    if (!isCopyrightClear) {
       throw new ForbiddenException("El archivo subido parece contener material con copyright detectado por el sistema de huella digital (ACRCloud SIM).");
    }

    const newTrack = await (this.prisma.track as any).create({
      data: {
        title: dto.title,
        artistId: artist.id,
        discovererId: user.id,
        status: 'PENDING', // Queda en revisión por defecto
        thumbnailUrl: dto.coverUrl || "https://images.unsplash.com/photo-1516280440502-86ed0ee20078?q=80&w=500&auto=format&fit=crop", 
        duration: 215,
        cause: dto.cause || null,
        sources: {
          create: {
            provider: 'DIGNIFY',
            providerId: mockFileUrl,
            url: mockFileUrl,
            isOfficial: true,
            quality: 'HD'
          }
        }
      }
    });

    return { data: newTrack };
  }

  private async checkCopyright(title: string, artist: string): Promise<boolean> {
     // Simulación de ACRCloud o similar
     // Si el título es "Despacito" lo rechazamos para el ejemplo
     if (title.toLowerCase().includes("despacito")) return false;
     return true;
  }

  @Delete(':id')
  async deleteTrack(@Param('id') internalTrackId: string) {
    try {
      // Borramos fuentes primero por Foreign Key
      await this.prisma.source.deleteMany({
        where: { trackId: internalTrackId }
      });
      // Luego la pista real
      await this.prisma.track.delete({
        where: { id: internalTrackId }
      });
      return { success: true };
    } catch(e) {
      return { success: false, error: e };
    }
  }

  @Post(':id/listen')
  async recordListen(@Param('id') id: string, @Body() dto: { userEmail?: string }) {
    if (!dto.userEmail) return { success: false };

    // Buscamos el track para ver si es de un artista verificado
    const track = await (this.prisma.track as any).findUnique({
      where: { id },
      include: { artist: true }
    });

    if (track && track.artist.isVerified) {
       // Sumamos 10 puntos ReFi al usuario por cada escucha completa a un artista verificado
       await (this.prisma.user as any).update({
         where: { email: dto.userEmail },
         data: { curationPoints: { increment: 10 } }
       });
       return { success: true, pointsAdded: 10 };
    }

    return { success: true, pointsAdded: 0 };
  }
}
