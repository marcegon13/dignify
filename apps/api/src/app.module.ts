import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SourcesModule } from './sources/sources.module';
import { MetadataModule } from './metadata/metadata.module';
import { SearchModule } from './search/search.module';
import { DatabaseModule } from './common/database.module';
import { FavoritesModule } from './favorites/favorites.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { AdminModule } from './admin/admin.module';

import { TracksController } from './tracks/tracks.controller';
import { UsersController } from './users/users.controller';

@Module({
  imports: [DatabaseModule, SourcesModule, MetadataModule, SearchModule, FavoritesModule, PlaylistsModule, AdminModule],
  controllers: [AppController, TracksController, UsersController],
  providers: [AppService],
})
export class AppModule {}
