import { Injectable, Logger } from '@nestjs/common';
import { YoutubeConnector } from './connectors/youtube.connector';
import { SoundcloudConnector } from './connectors/soundcloud.connector';
import { BandcampConnector } from './connectors/bandcamp.connector';
import { RawSourceData } from './interfaces/raw-source-data.interface';
import { ISourceConnector } from './interfaces/source-connector.interface';

@Injectable()
export class SourcesService {
  private readonly logger = new Logger(SourcesService.name);
  private connectors: ISourceConnector[];

  constructor(
    private readonly youtubeConnector: YoutubeConnector,
    private readonly soundcloudConnector: SoundcloudConnector,
    private readonly bandcampConnector: BandcampConnector,
  ) {
    this.connectors = [
      this.youtubeConnector,
      this.soundcloudConnector,
      this.bandcampConnector,
    ];
  }

  /**
   * Dispatches search query to all registered connectors simultaneously
   */
  async searchAll(query: string, maxResultsPerConnector: number = 5): Promise<RawSourceData[]> {
    const promises = this.connectors.map(connector => connector.search(query, maxResultsPerConnector));
    
    // Using Promise.allSettled so one failing connector won't crash the entire request
    const results = await Promise.allSettled(promises);
    
    let allTracks: RawSourceData[] = [];
    
    results.forEach((res, index) => {
      if (res.status === 'fulfilled') {
        allTracks = [...allTracks, ...res.value];
      } else {
        this.logger.error(
          `Connector [${this.connectors[index].providerName}] failed during search:`, 
          res.reason
        );
      }
    });

    return allTracks;
  }
}
