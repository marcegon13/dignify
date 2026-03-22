import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../common/prisma.service';
import { SearchResult } from './search.service';

@Injectable()
export class SemanticSearchService {
  private readonly logger = new Logger(SemanticSearchService.name);
  private openai: OpenAI;

  constructor(private readonly prisma: PrismaService) {
    // Tolerante a nulo si no hay API KEY provista para MVP
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'fake-api-key' });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!process.env.OPENAI_API_KEY) {
      this.logger.warn('Skipping embedding generation (Missing OPENAI_API_KEY)');
      return new Array(1536).fill(0); // mock vector
    }
    
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      return response.data[0].embedding;
    } catch (e) {
      this.logger.error('Error generating embedding', e);
      return new Array(1536).fill(0);
    }
  }

  // To be called asynchronously after Upsert
  async indexTrack(trackId: string, title: string, artistName: string) {
    const textToEmbed = `Music Track - Title: ${title}, Artist: ${artistName}. Vibe: emotional, aesthetic, resonant.`;
    const vectorString = `[${(await this.generateEmbedding(textToEmbed)).join(',')}]`;

    try {
      // Prisma raw execution for pgvector
      await this.prisma.$executeRawUnsafe(`
        UPDATE "Track" 
        SET embedding = $1::vector
        WHERE id = $2
      `, vectorString, trackId);
      
      this.logger.log(`Track ${trackId} embedded successfully`);
    } catch (e) {
      this.logger.warn(`Failed to save embedding. Ensure pgvector is active. Error: ${e}`);
    }
  }

  async searchBySentiment(query: string, maxResults = 10): Promise<SearchResult[]> {
    const queryVector = `[${(await this.generateEmbedding(query)).join(',')}]`;

    try {
      // Vector distance query bypass (Since we disabled pgvector locally)
      this.logger.log(`Mocking semantic search vs basic string search for vibe: ${query}`);
      const isExploreMockQuery = query.includes('vibes') || query.includes('deep work') || query.includes('native') || query.includes('trending') || query.includes('zero discovery');

      const tracksWithSources = await this.prisma.track.findMany({
        where: isExploreMockQuery ? {} : {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { artist: { name: { contains: query, mode: 'insensitive' } } }
          ]
        },
        take: 20,
        orderBy: { updatedAt: 'asc' },
        include: { sources: true, artist: true }
      });

      return tracksWithSources.map((trk: any) => ({
         id: trk.sources[0]?.providerId || trk.id.toString(),
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
    } catch (e) {
      this.logger.warn(`Semantic search failed, returning empty. Error: ${e}`);
      return [];
    }
  }
}
