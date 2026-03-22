import { Injectable, Logger } from '@nestjs/common';
import { ISourceConnector } from '../interfaces/source-connector.interface';
import { RawSourceData } from '../interfaces/raw-source-data.interface';

@Injectable()
export class BandcampConnector implements ISourceConnector {
  public readonly providerName = 'BANDCAMP';
  private readonly logger = new Logger(BandcampConnector.name);

  async search(query: string, maxResults: number = 10): Promise<RawSourceData[]> {
    try {
      const url = new URL('https://bandcamp.com/api/fuzzysearch/1/autocomplete');
      url.searchParams.append('q', query);

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      
      // Filtermos resultados de tipo "t" (track) o "a" (album) si se requiere
      const tracks = data.auto.results
        .filter((item: any) => item.type === 't')
        .slice(0, maxResults);

      return tracks.map((item: any) => ({
        provider: this.providerName,
        providerId: item.id.toString(), // bandcamp internal id
        title: item.name,
        artistName: item.band_name,
        url: item.url,
        thumbnailUrl: item.img ? `https://f4.bcbits.com/img/a${item.img}_10.jpg` : undefined, // _10 es portada HQ en bandcamp
        quality: 'HQ', // By nature of platform
      })) as RawSourceData[];

    } catch (error) {
      this.logger.error(`Error searching Bandcamp for "${query}":`, error);
      return [];
    }
  }

  async getById(id: string): Promise<RawSourceData | null> {
    return null; // A simple implementation for now
  }
}
