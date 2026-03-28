import { Injectable, Logger } from '@nestjs/common';
import { ISourceConnector } from '../interfaces/source-connector.interface';
import { RawSourceData } from '../interfaces/raw-source-data.interface';

@Injectable()
export class YoutubeConnector implements ISourceConnector {
  public readonly providerName = 'YOUTUBE';
  private readonly logger = new Logger(YoutubeConnector.name);
  private readonly apiKey = process.env.YOUTUBE_API_KEY || 'AIzaSyCPaHAvfRXBLajzZHNSlajQDc0Gx7-xFbU';
  private readonly baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor() {
    if (!this.apiKey) {
      this.logger.warn('YOUTUBE_API_KEY is not defined in the environment. YouTube connector will not work.');
    }
  }

  async search(query: string, maxResults: number = 30): Promise<RawSourceData[]> {
    if (!this.apiKey) return [];

    try {
      const searchUrl = new URL(`${this.baseUrl}/search`);
      searchUrl.searchParams.append('part', 'snippet');
      searchUrl.searchParams.append('q', query);
      searchUrl.searchParams.append('type', 'video');
      searchUrl.searchParams.append('videoCategoryId', '10'); // Music
      searchUrl.searchParams.append('maxResults', maxResults.toString());
      searchUrl.searchParams.append('key', this.apiKey);

      console.log('Searching YouTube with URL:', searchUrl.toString());
      console.log('Using API Key (last 4 chars):', this.apiKey?.slice(-4));

      const response = await fetch(searchUrl.toString());
      if (!response.ok) {
        const errorBody = await response.text();
        console.error('YouTube API ERROR BODY:', errorBody);
        throw new Error(`YouTube API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('YouTube Search results count:', data.items?.length || 0);
      
      return data.items.map((item: any) => ({
        provider: this.providerName,
        providerId: item.id.videoId,
        title: item.snippet.title,
        artistName: item.snippet.channelTitle,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
      })) as RawSourceData[];

    } catch (error) {
      this.logger.error(`Error searching YouTube for "${query}":`, error);
      return [];
    }
  }

  async getById(id: string): Promise<RawSourceData | null> {
    if (!this.apiKey) return null;

    try {
      const videoUrl = new URL(`${this.baseUrl}/videos`);
      videoUrl.searchParams.append('part', 'snippet,contentDetails');
      videoUrl.searchParams.append('id', id);
      videoUrl.searchParams.append('key', this.apiKey);

      const response = await fetch(videoUrl.toString());
      if (!response.ok) {
        throw new Error(`YouTube API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (!data.items || data.items.length === 0) return null;

      const item = data.items[0];
      const ptDuration = item.contentDetails?.duration;
      const isHd = item.contentDetails?.definition === 'hd';

      return {
        provider: this.providerName,
        providerId: item.id,
        title: item.snippet.title,
        artistName: item.snippet.channelTitle,
        url: `https://www.youtube.com/watch?v=${item.id}`,
        thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        duration: this.parseISO8601Duration(ptDuration),
        quality: isHd ? 'HD' : 'LQ',
      };
    } catch (error) {
      this.logger.error(`Error resolving YouTube video "${id}":`, error);
      return null;
    }
  }

  /**
   * Helper to parse ISO 8601 duration string ('PT1H2M10S') into seconds
   */
  private parseISO8601Duration(duration: string): number {
    if (!duration) return 0;
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    
    return hours * 3600 + minutes * 60 + seconds;
  }
}
