import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

const SEED_TRACKS = [
  // HIGH FIDELITY DIRECT AUDIO TEST
  { 
    title: "Sunset Session (Direct Audio)", 
    artist: "Dignify Exclusives", 
    provider: "DIGNIFY" as const, // mark as native DIGNIFY
    providerId: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", 
    thumbnailUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500&auto=format&fit=crop" 
  },
  // YOUTUBE TRACKS
  { title: "Sunset Lover", artist: "Petit Biscuit", providerId: "WUvTkaaNkzM", thumbnailUrl: "https://i.ytimg.com/vi/WUvTkaaNkzM/hqdefault.jpg" },
  { title: "Gooey", artist: "Glass Animals", providerId: "jeo3an2M_Lo", thumbnailUrl: "https://i.ytimg.com/vi/jeo3an2M_Lo/hqdefault.jpg" },
  { title: "Stolen Dance", artist: "Milky Chance", providerId: "iX-QaNzd-0Y", thumbnailUrl: "https://i.ytimg.com/vi/iX-QaNzd-0Y/hqdefault.jpg" },
  { title: "Riptide", artist: "Vance Joy", providerId: "uJ_1HMAGb4k", thumbnailUrl: "https://i.ytimg.com/vi/uJ_1HMAGb4k/hqdefault.jpg" },
  { title: "Electric Feel", artist: "MGMT", providerId: "MmZexg8sxyk", thumbnailUrl: "https://i.ytimg.com/vi/MmZexg8sxyk/hqdefault.jpg" },
  { title: "Sleep on the Floor", artist: "The Lumineers", providerId: "v4pi1LxuDHc", thumbnailUrl: "https://i.ytimg.com/vi/v4pi1LxuDHc/hqdefault.jpg" },
  { title: "Chamber Of Reflection", artist: "Mac DeMarco", providerId: "NY8XtXCb2vo", thumbnailUrl: "https://i.ytimg.com/vi/NY8XtXCb2vo/hqdefault.jpg" },
  { title: "Wait", artist: "M83", providerId: "lAwYodrBr2Q", thumbnailUrl: "https://i.ytimg.com/vi/lAwYodrBr2Q/hqdefault.jpg" },
  { title: "Feels Like We Only Go Backwards", artist: "Tame Impala", providerId: "wycjnCCgUes", thumbnailUrl: "https://i.ytimg.com/vi/wycjnCCgUes/hqdefault.jpg" },
  { title: "Walking On A Dream", artist: "Empire of the Sun", providerId: "eimgRedLkkU", thumbnailUrl: "https://i.ytimg.com/vi/eimgRedLkkU/hqdefault.jpg" },
  { title: "Pumped Up Kicks", artist: "Foster The People", providerId: "SDTZ7iX4vTQ", thumbnailUrl: "https://i.ytimg.com/vi/SDTZ7iX4vTQ/hqdefault.jpg" },
  { title: "Take Me", artist: "Rüfüs Du Sol", providerId: "N1SgVf3hP44", thumbnailUrl: "https://i.ytimg.com/vi/N1SgVf3hP44/hqdefault.jpg" },
];

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    this.logger.log('Checking database sanity for initial seed...');
    try {
      const count = await this.prisma.track.count();
      if (count === 0) {
        this.logger.log('Database empty. Seeding Chapadmalal ReFi Vibe tracks 🌊...');
        await this.runSeed();
        this.logger.log('Seeding completed successfully!');
      } else {
        this.logger.log(`Database already has ${count} tracks stored.`);
      }
    } catch (e) {
      this.logger.error('Failed to run seed process', e);
    }
  }

  private async runSeed() {
    for (const data of SEED_TRACKS) {
      let artist = await this.prisma.artist.findUnique({ where: { name: data.artist } });
      if (!artist) {
        artist = await this.prisma.artist.create({ data: { name: data.artist, isVerified: true } });
      }

      const track = await this.prisma.track.create({
        data: {
          title: data.title,
          artistId: artist.id,
          thumbnailUrl: data.thumbnailUrl,
          duration: Math.floor(Math.random() * 100) + 180, // Random 3 to 4.5 mins
        }
      });

      await this.prisma.source.create({
        data: {
          trackId: track.id,
          provider: (data as any).provider || 'YOUTUBE',
          providerId: data.providerId,
          url: (data as any).provider === 'DIGNIFY' ? data.providerId : `https://youtube.com/watch?v=${data.providerId}`,
          isOfficial: true,
          quality: 'HD'
        }
      });
    }
  }
}
