import { Injectable, NotFoundException, ForbiddenException, Logger, OnModuleInit, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { StorageService } from '../common/storage.service';
import { TrackStatus } from '@dignify/database';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffprobePath from '@ffprobe-installer/ffprobe';
import path from 'path';
import fs from 'fs';

// Configuración automática de binarios
ffmpeg.setFfmpegPath(ffmpegPath.path);
ffmpeg.setFfprobePath(ffprobePath.path);

@Injectable()
export class StreamingService implements OnModuleInit {
  private readonly logger = new Logger(StreamingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  onModuleInit() {
    this.logger.log(`[HLS] Utilizando binario FFmpeg: ${ffmpegPath.path}`);
    ffmpeg.getAvailableFormats((err) => {
      if (err) {
        this.logger.error('[HLS] FFmpeg sigue sin ser detectado correctamente.');
      } else {
        this.logger.log('[HLS] FFmpeg detectado y listo via @ffmpeg-installer.');
      }
    });
  }

  async validateArtist(userEmail: string) {
    const user = await this.prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) throw new NotFoundException("Usuario no encontrado.");
    if (user.role !== 'ARTIST') {
      throw new ForbiddenException("Solo los usuarios con rol de ARTISTA pueden cargar tracks.");
    }
    return user;
  }

  async getOrCreateArtist(user: any) {
    const userNameOrEmail = user.name || (user.email ? user.email.split('@')[0] : 'Unknown');
    let artist = await this.prisma.artist.findFirst({ where: { name: userNameOrEmail } });
    if (!artist) {
      artist = await this.prisma.artist.create({
        data: {
          name: userNameOrEmail,
          slug: userNameOrEmail.toLowerCase().replace(/\s+/g, '-'),
          isVerified: true,
          userId: user.id
        }
      });
    }
    return artist;
  }

  async processUpload(file: any, dto: { title: string; genre: string; userEmail: string; coverUrl?: string; cause?: string }) {
    const user = await this.validateArtist(dto.userEmail);
    const artist = await this.getOrCreateArtist(user);

    // 1. Guardar archivo original temporalmente
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const tempFileName = `temp-${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    const tempFilePath = path.join(uploadDir, tempFileName);
    fs.writeFileSync(tempFilePath, file.buffer);

    // 2. VALIDACIÓN CRÍTICA: ffprobe para detectar archivos corruptos
    try {
      await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(tempFilePath, (err, metadata) => {
          if (err) reject(new BadRequestException("El archivo de audio está corrupto o no es compatible."));
          else resolve(metadata);
        });
      });
    } catch (err) {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      throw err;
    }

    // 3. Preparar estructura HLS adaptativa (Multi-bitrate)
    const trackId = `track-${Date.now()}`;
    const hlsBaseDir = path.join(uploadDir, 'hls', trackId);
    fs.mkdirSync(path.join(hlsBaseDir, 'low'), { recursive: true });
    fs.mkdirSync(path.join(hlsBaseDir, 'high'), { recursive: true });

    // Generar Master Playlist (.m3u8)
    const masterPlaylistContent = 
`#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=64000,CODECS="mp4a.40.2"
low/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=192000,CODECS="mp4a.40.2"
high/index.m3u8`;

    fs.writeFileSync(path.join(hlsBaseDir, 'master.m3u8'), masterPlaylistContent);

    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const finalUrl = `${apiUrl}/uploads/hls/${trackId}/master.m3u8`;

    // 4. Lanzar fragmentación en segundo plano (Adaptive Quality)
    this.runAdaptiveFragmentation(tempFilePath, hlsBaseDir, trackId, dto.title);

    // 5. Crear registro en la DB
    return this.prisma.track.create({
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
            providerId: trackId,
            url: finalUrl,
            isOfficial: true,
            quality: 'ADAPTIVE'
          }
        }
      },
      include: { sources: true, artist: true }
    });
  }

  private async runAdaptiveFragmentation(sourcePath: string, baseDir: string, trackId: string, title: string) {
    this.logger.log(`[ReFi-HLS] Generando streaming adaptativo para: ${title}`);

    const generateVariant = (bitrate: string, subDir: string) => {
      return new Promise((resolve, reject) => {
        ffmpeg(sourcePath)
          .outputOptions([
            '-start_number 0',
            '-hls_time 6',
            '-hls_list_size 0',
            '-f hls',
            '-codec:a aac',
            `-b:a ${bitrate}`
          ])
          .output(path.join(baseDir, subDir, 'index.m3u8'))
          .on('end', resolve)
          .on('error', reject)
          .run();
      });
    };

    try {
      // Paralelizar generación de calidades
      await Promise.all([
        generateVariant('64k', 'low'),
        generateVariant('192k', 'high')
      ]);
      this.logger.log(`[HLS] [${title}] ¡Fragmentación adaptativa completada!`);
    } catch (err: any) {
      this.logger.error(`[HLS] Error en fragmentación adaptativa: ${err.message || err}`);
    } finally {
      if (fs.existsSync(sourcePath)) fs.unlinkSync(sourcePath);
    }
  }
}
