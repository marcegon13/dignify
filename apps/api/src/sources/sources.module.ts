import { Module } from '@nestjs/common';
import { SourcesService } from './sources.service';
import { YoutubeConnector } from './connectors/youtube.connector';
import { SoundcloudConnector } from './connectors/soundcloud.connector';
import { BandcampConnector } from './connectors/bandcamp.connector';
import { DeezerConnector } from './connectors/deezer.connector';

@Module({
  providers: [
    SourcesService,
    YoutubeConnector,
    SoundcloudConnector,
    BandcampConnector,
    DeezerConnector,
  ],
  exports: [
    SourcesService,
  ],
})
export class SourcesModule {}
