import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { SourcesModule } from './sources/sources.module';
import { MetadataModule } from './metadata/metadata.module';
import { SearchModule } from './search/search.module';
import { FavoritesModule } from './favorites/favorites.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { AdminModule } from './admin/admin.module';
import { DatabaseModule } from './common/database.module';

import { TracksController } from './tracks/tracks.controller';
import { UsersController } from './users/users.controller';

import { PrismaService } from './common/prisma.service';
import { S3Service } from './common/s3.service';
import { StorageService } from './common/storage.service';
import { UsersService } from './users/users.service';
import { StreamingService } from './tracks/streaming.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',

      validate: (config: Record<string, string>) => {

        return config;
      },
    }),

    DatabaseModule,
    SourcesModule,
    MetadataModule,
    SearchModule,
    FavoritesModule,
    PlaylistsModule,
    AdminModule,

  ],

  controllers: [
    AppController,
    TracksController,
    UsersController,
  ],

  providers: [
    AppService,
    PrismaService,
    S3Service,
    StorageService,
    UsersService,
    StreamingService,
  ],
})
export class AppModule { }
