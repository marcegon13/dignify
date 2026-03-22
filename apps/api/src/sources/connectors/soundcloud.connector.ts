import { Injectable, Logger } from '@nestjs/common';
import { ISourceConnector } from '../interfaces/source-connector.interface';
import { RawSourceData } from '../interfaces/raw-source-data.interface';

@Injectable()
export class SoundcloudConnector implements ISourceConnector {
  public readonly providerName = 'SOUNDCLOUD';
  private readonly logger = new Logger(SoundcloudConnector.name);
  private readonly clientId = process.env.SOUNDCLOUD_CLIENT_ID;

  async search(query: string, maxResults: number = 10): Promise<RawSourceData[]> {
    if (!this.clientId) {
      this.logger.warn('SOUNDCLOUD_CLIENT_ID is not defined. Skipping SoundCloud search.');
      return [];
    }

    try {
      const url = new URL('https://api-v2.soundcloud.com/search/tracks');
      url.searchParams.append('q', query);
      url.searchParams.append('limit', maxResults.toString());
      url.searchParams.append('client_id', this.clientId);

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();

      return data.collection.map((item: any) => ({
        provider: this.providerName,
        providerId: item.id.toString(),
        title: item.title,
        artistName: item.user.username,
        url: item.permalink_url,
        thumbnailUrl: item.artwork_url?.replace('-large', '-t500x500') || item.user.avatar_url,
        duration: Math.floor(item.duration / 1000), // ms to seconds
        quality: 'HQ',
      })) as RawSourceData[];

    } catch (error) {
      this.logger.error(`Error searching SoundCloud for "${query}":`, error);
      return [];
    }
  }

  async getById(id: string): Promise<RawSourceData | null> {
    // Implementación futura si es necesario resolver detalles por ID
    return null;
  }
}
