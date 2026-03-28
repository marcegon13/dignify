import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { StorageService } from '../common/storage.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        birthDate: true,
        role: true,
        curationPoints: true,
        causes: true,
        spotifyId: true,
        youtubeId: true,
        favorites: {
          where: { isFirstDiscovery: true },
          take: 1,
        },
      },
    });

    if (!user) return null;

    return {
      ...user,
      hasFirstDiscovery: user.favorites.length > 0,
    };
  }

  async update(email: string, data: any) {
    try {
      if (data.birthDate && typeof data.birthDate === 'string') {
        data.birthDate = new Date(data.birthDate);
      }

      return await this.prisma.user.update({
        where: { email },
        data,
      });
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new BadRequestException('El nombre de usuario ya está en uso.');
      }
      throw e;
    }
  }

  async uploadAvatar(email: string, file: any) {
    const imageUrl = await this.storage.uploadFile(file, 'avatars');

    const user = await this.prisma.user.update({
      where: { email },
      data: { image: imageUrl },
      include: { artist: true },
    });

    if (user.artist) {
      await (this.prisma.artist as any).update({
        where: { id: user.artist.id },
        data: { image: imageUrl },
      });
    }

    return user;
  }
}
