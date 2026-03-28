import { Injectable, Logger } from '@nestjs/common';
import { ISourceConnector } from '../interfaces/source-connector.interface';
import { RawSourceData } from '../interfaces/raw-source-data.interface';

@Injectable()
export class DeezerConnector implements ISourceConnector {
  public readonly providerName = 'DEEZER';
  private readonly logger = new Logger(DeezerConnector.name);
  private readonly baseUrl = 'https://api.deezer.com';

  async search(query: string, maxResults: number = 30): Promise<RawSourceData[]> {
    try {
      const searchUrl = new URL(`${this.baseUrl}/search`);
      searchUrl.searchParams.append('q', query);
      searchUrl.searchParams.append('limit', maxResults.toString());

      const response = await fetch(searchUrl.toString());
      if (!response.ok) {
        throw new Error(`Deezer API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.data) return [];

      return data.data.map((item: any) => ({
        provider: this.providerName,
        providerId: item.id.toString(),
        title: item.title,
        artistName: item.artist.name,
        url: item.link,
        thumbnailUrl: item.album.cover_xl || item.album.cover_big || item.album.cover_medium,
        duration: item.duration,
        quality: 'HQ',
      })) as RawSourceData[];

    } catch (error) {
      this.logger.error(`Error searching Deezer for "${query}":`, error);
      return [];
    }
  }

  async getById(id: string): Promise<RawSourceData | null> {
    try {
      const trackUrl = new URL(`${this.baseUrl}/track/${id}`);
      const response = await fetch(trackUrl.toString());
      if (!response.ok) return null;

      const item = await response.json();
      if (item.error) return null;

      return {
        provider: this.providerName,
        providerId: item.id.toString(),
        title: item.title,
        artistName: item.artist.name,
        url: item.link,
        thumbnailUrl: item.album.cover_xl || item.album.cover_big || item.album.cover_medium,
        duration: item.duration,
        quality: 'HQ',
      };
    } catch (error) {
      this.logger.error(`Error resolving Deezer track "${id}":`, error);
      return null;
    }
  }
}
