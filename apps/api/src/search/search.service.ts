import { Injectable } from '@nestjs/common';
import { SourcesService } from '../sources/sources.service';
import { MetadataResolverService } from '../metadata/metadata.service';
import { RawSourceData } from '../sources/interfaces/raw-source-data.interface';
import { PrismaService } from '../common/prisma.service';
import { SemanticSearchService } from './semantic.service';

export interface SearchResult {
  id: string; // fallback
  internalTrackId: string; // The db id
  artist: string;
  title: string;
  genre?: string;
  duration?: number;
  thumbnailUrl?: string;
  cause?: string;
  sources: {
    provider: string;
    providerId: string;
    url: string;
    quality?: string;
    isOfficial: boolean;
  }[];
}

@Injectable()
export class SearchService {
  constructor(
    private readonly sourcesService: SourcesService,
    private readonly metadataResolver: MetadataResolverService,
    private readonly prisma: PrismaService,
    private readonly semanticService: SemanticSearchService,
  ) {}

  async searchMusic(query: string): Promise<SearchResult[]> {
    let matchingLocalTracks: any[] = [];
    let topSpotTrack: any = null;

    try {
      // 1. Prioridad Independiente (DIGNIFY DIRECTO)
      matchingLocalTracks = await (this.prisma.track as any).findMany({
        where: {
          status: 'APPROVED',
          artist: { isVerified: true }, // PRIORIDAD VERIFICADOS
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { artist: { name: { contains: query, mode: 'insensitive' } } }
          ]
        },
        include: {
          artist: true,
          sources: true
        },
        take: 3
      });

      topSpotTrack = matchingLocalTracks[0] || null;
      
      // Si no hay match local con la búsqueda, forzamos un artista verificado de Dignify como curación obligatoria en el Top Spot
      if (!topSpotTrack) {
          topSpotTrack = await (this.prisma.track as any).findFirst({
            where: {
              status: 'APPROVED',
              artist: { isVerified: true },
              sources: {
                some: { provider: 'DIGNIFY' }
              }
            },
            include: {
              artist: true,
              sources: true
            },
            orderBy: { updatedAt: 'desc' }
          });
      }
    } catch (e) {
      console.error('Database connection failed during search initial check. Proceeding with external results only.', e);
      matchingLocalTracks = [];
      topSpotTrack = null;
    }

    // 2. Búsqueda agregada (Ajustamos a 25 para equilibrio entre abundancia y velocidad)
    const rawResults: RawSourceData[] = await this.sourcesService.searchAll(query, 25);

    const groupedTracks = new Map<string, {
       artist: string;
       title: string;
       thumbnailUrl?: string;
       duration?: number;
       genre?: string;
       sources: RawSourceData[]
    }>();

    rawResults.forEach(rawTrack => {
      const resolved = this.metadataResolver.resolveTrack(rawTrack.title, rawTrack.artistName);
      const key = `${resolved.artist.toLowerCase()}|||${resolved.title.toLowerCase()}`;
      
      if (!groupedTracks.has(key)) {
         groupedTracks.set(key, { 
           ...resolved, 
           thumbnailUrl: rawTrack.thumbnailUrl, 
           duration: rawTrack.duration, 
           sources: [],
           genre: (rawTrack as any).genre || undefined 
         });
      }
      const groupInfo = groupedTracks.get(key)!;
      groupInfo.sources.push(rawTrack);
      
      if (!groupInfo.thumbnailUrl && rawTrack.thumbnailUrl) {
        groupInfo.thumbnailUrl = rawTrack.thumbnailUrl;
      }
    });

    // 3. Resolución PROACTIVA de YouTube para resultados que no lo tienen
    // Esto asegura que al pulsar Play, el ID ya esté listo.
    const groupsArray = Array.from(groupedTracks.values());
    const youtubeConnector = (this.sourcesService as any).connectors.find((c: any) => c.constructor.name === 'YoutubeConnector');

    // Solo resolvemos los primeros 12 para mantener la velocidad
    for (let i = 0; i < Math.min(groupsArray.length, 12); i++) {
      const group = groupsArray[i];
      const hasYoutube = group.sources.some(s => s.provider === 'YOUTUBE');
      
      if (!hasYoutube && youtubeConnector) {
        try {
          // Búsqueda rápida y específica
          const ytMatch = await youtubeConnector.search(`${group.artist} ${group.title}`, 1);
          if (ytMatch && ytMatch.length > 0) {
            group.sources.push(ytMatch[0]);
          }
        } catch (e) {
          // Si falla, seguimos adelante
        }
      }
    }

    const resolvedResults: SearchResult[] = groupsArray.map(group => {
      const ytSource = group.sources.find(s => s.provider === 'YOUTUBE');
      return {
        id: ytSource?.providerId || group.sources[0].providerId,
        internalTrackId: 'temp-' + group.sources[0].providerId,
        artist: group.artist,
        title: group.title,
        genre: group.genre,
        duration: group.duration,
        thumbnailUrl: group.thumbnailUrl,
        sources: group.sources.map(raw => ({
          provider: raw.provider,
          providerId: raw.providerId,
          url: raw.url,
          quality: raw.quality,
          isOfficial: this.metadataResolver.resolveTrack(raw.title, raw.artistName).isOfficial,
        }))
      };
    });

    // Sincronización en SEGUNDO PLANO mejorada
    this.backgroundSync(groupsArray).catch(() => {});

    let finalResults: SearchResult[] = [];
    
    if (topSpotTrack) {
      const topResult: SearchResult = {
        id: topSpotTrack.sources.find((s: any) => s.provider === 'YOUTUBE')?.providerId || topSpotTrack.id,
        internalTrackId: topSpotTrack.id,
        artist: topSpotTrack.artist.name,
        title: topSpotTrack.title,
        genre: (topSpotTrack as any).genre || undefined,
        thumbnailUrl: topSpotTrack.thumbnailUrl || undefined,
        cause: (topSpotTrack as any).cause || undefined,
        sources: topSpotTrack.sources.map((src: any) => ({
          provider: src.provider,
          providerId: src.providerId,
          url: src.url,
          isOfficial: src.isOfficial
        }))
      };
      finalResults.push(topResult);
    }

    resolvedResults.forEach(res => {
      const isDuplicate = topSpotTrack && res.sources.some(s => 
        topSpotTrack.sources.some((ts: any) => ts.providerId === s.providerId)
      );
      if (isDuplicate) return;
      finalResults.push(res);
    });

    return finalResults;
  }

  /**
   * Procesa y guarda los temas en la base de datos sin bloquear la respuesta del usuario
   */
  private async backgroundSync(groups: any[]) {
    for (const group of groups) {
      try {
        const artist = await this.prisma.artist.upsert({
          where: { name: group.artist },
          update: {},
          create: { name: group.artist },
        });

        const track = await (this.prisma.track as any).upsert({
          where: {
            title_artistId: { title: group.title, artistId: artist.id },
          },
          update: {
            updatedAt: new Date(),
            duration: group.duration || undefined,
            thumbnailUrl: group.thumbnailUrl || undefined,
            genre: group.genre || undefined,
          },
          create: {
            title: group.title,
            artistId: artist.id,
            duration: group.duration,
            thumbnailUrl: group.thumbnailUrl,
            genre: group.genre || undefined,
          },
        });

        for (const rawTrack of group.sources) {
          const isOfficial = this.metadataResolver.resolveTrack(rawTrack.title, rawTrack.artistName).isOfficial;
          await this.prisma.source.upsert({
            where: {
              provider_providerId: { provider: rawTrack.provider, providerId: rawTrack.providerId },
            },
            update: { updatedAt: new Date(), url: rawTrack.url },
            create: {
              trackId: track.id,
              provider: rawTrack.provider,
              providerId: rawTrack.providerId,
              url: rawTrack.url,
              quality: rawTrack.quality,
              isOfficial,
            },
          });
        }
        
        // Indexamos para búsqueda semántica
        await this.semanticService.indexTrack(track.id, group.title, group.artist).catch(() => {});
      } catch (e) {
        // Silenciamos errores de fondo para no afectar al usuario
      }
    }
  }

  async getRecommended(userEmail?: string): Promise<SearchResult[]> {
    let userCauses: string[] = [];
    if (userEmail) {
       const user = await (this.prisma.user as any).findUnique({ where: { email: userEmail }, select: { causes: true } });
       if (user && user.causes) userCauses = user.causes;
    }

    const whereClause = userCauses.length > 0 ? {
       status: 'APPROVED',
       OR: [
         { cause: { in: userCauses } },
         { cause: null }
       ]
    } : { status: 'APPROVED' };

    const topTracks = await (this.prisma.track as any).findMany({
      where: whereClause,
      take: 10,
      orderBy: { updatedAt: 'desc' },
      include: {
        artist: true,
        sources: true,
      }
    });

    return topTracks.map((trk: any) => ({
       id: trk.sources[0]?.providerId || trk.id.toString(),
       internalTrackId: trk.id,
       artist: trk.artist.name,
       title: trk.title,
       genre: trk.genre || undefined,
       duration: trk.duration || undefined,
       thumbnailUrl: trk.thumbnailUrl || undefined,
       cause: trk.cause || undefined,
       sources: trk.sources.map((src: any) => ({
         provider: src.provider,
         providerId: src.providerId || '',
         url: src.url,
         isOfficial: src.isOfficial
       }))
    }));
  }
}
