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
    // 1. Prioridad Independiente (DIGNIFY DIRECTO)
    const matchingLocalTracks = await (this.prisma.track as any).findMany({
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

    let topSpotTrack: any = matchingLocalTracks[0] || null;
    
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

    // 2. Búsqueda agregada
    const rawResults: RawSourceData[] = await this.sourcesService.searchAll(query, 10);

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

    const resolvedResults = await Promise.all(
      Array.from(groupedTracks.values()).map(async (group) => {
        const artist = await this.prisma.artist.upsert({
          where: { name: group.artist },
          update: {},
          create: { name: group.artist },
        });

        const track = await (this.prisma.track as any).upsert({
          where: {
            title_artistId: {
              title: group.title,
              artistId: artist.id,
            },
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

        await Promise.all(group.sources.map(async rawTrack => {
          const isOfficial = this.metadataResolver.resolveTrack(rawTrack.title, rawTrack.artistName).isOfficial;
          await this.prisma.source.upsert({
            where: {
              provider_providerId: {
                provider: rawTrack.provider,
                providerId: rawTrack.providerId,
              },
            },
            update: {
              updatedAt: new Date(),
              url: rawTrack.url,
            },
            create: {
              trackId: track.id,
              provider: rawTrack.provider,
              providerId: rawTrack.providerId,
              url: rawTrack.url,
              quality: rawTrack.quality,
              isOfficial,
            },
          });
        }));

        this.semanticService.indexTrack(track.id, group.title, group.artist).catch(console.error);

        return {
          id: group.sources[0].providerId, 
          internalTrackId: track.id,
          artist: group.artist,
          title: group.title,
          genre: group.genre,
          duration: group.duration,
          thumbnailUrl: group.thumbnailUrl,
          sources: group.sources.map(raw => ({
             provider: raw.provider,
             url: raw.url,
             quality: raw.quality,
             isOfficial: this.metadataResolver.resolveTrack(raw.title, raw.artistName).isOfficial,
          }))
        };
      })
    );

    let finalResults: SearchResult[] = [];
    
    if (topSpotTrack) {
      const topResult: SearchResult = {
        id: topSpotTrack.sources[0]?.providerId || topSpotTrack.id,
        internalTrackId: topSpotTrack.id,
        artist: topSpotTrack.artist.name,
        title: topSpotTrack.title,
        genre: (topSpotTrack as any).genre || undefined,
        thumbnailUrl: topSpotTrack.thumbnailUrl || undefined,
        cause: (topSpotTrack as any).cause || undefined,
        sources: topSpotTrack.sources.map((src: any) => ({
          provider: src.provider,
          url: src.url,
          isOfficial: src.isOfficial
        }))
      };
      finalResults.push(topResult);
    }

    resolvedResults.forEach(res => {
      if (topSpotTrack && res.internalTrackId === topSpotTrack.id) return;
      finalResults.push(res);
    });

    return finalResults;
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
         url: src.url,
         isOfficial: src.isOfficial
       }))
    }));
  }
}
