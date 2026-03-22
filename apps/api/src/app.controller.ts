import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './common/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('profile/stats/:email')
  async getProfileStats(@Req() req: any) {
    const email = req.params.email;
    if (!email) return { discoveries: 0, playlists: 0, favorites: 0 };
    
    // Find the actual user ID via email
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { discoveries: 0, playlists: 0, favorites: 0 };
    
    const [discoveries, playlists, favorites] = await Promise.all([
      this.prisma.track.count({ where: { discovererId: user.id } }),
      this.prisma.playlist.count({ where: { userId: user.id } }),
      this.prisma.favorite.count({ where: { userId: user.id } }),
    ]);

    return { discoveries, playlists, favorites };
  }
}
