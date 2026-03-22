import { Controller, Get, Patch, Body, Param, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { z } from 'zod';

const UserUpdateSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  birthDate: z.string().datetime().optional(),
  image: z.string().url().optional(),
  role: z.enum(['USER', 'ARTIST']).optional(),
  spotifyLink: z.string().url().optional(),
  youtubeLink: z.string().url().optional(),
  isVerified: z.boolean().optional(),
});

@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':email')
  async getUser(@Param('email') email: string) {
    const user = await (this.prisma.user as any).findUnique({
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
        spotifyLink: true,
        youtubeLink: true,
        isVerified: true,
        favorites: {
           where: { isFirstDiscovery: true },
           take: 1
        }
      }
    });

    if (!user) return { data: null };
    
    return { 
       data: {
         ...user,
         hasFirstDiscovery: user.favorites.length > 0
       }
    };
  }

  @Patch(':email')
  async updateProfile(@Param('email') email: string, @Body() body: any) {
    const result = UserUpdateSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException(result.error.format());
    }

    try {
      const data = { ...result.data };
      if (data.birthDate) {
        (data as any).birthDate = new Date(data.birthDate);
      }

      const updated = await (this.prisma.user as any).update({
        where: { email },
        data
      });
      return { data: updated };
    } catch (e) {
      if ((e as any).code === 'P2002') {
        throw new BadRequestException("El nombre de usuario ya está en uso.");
      }
      throw e;
    }
  }

  @Patch(':email/causes')
  async updateUserCauses(@Param('email') email: string, @Body() dto: { causes: string[] }) {
    const updated = await (this.prisma.user as any).update({
      where: { email },
      data: { causes: dto.causes }
    });
    return { data: updated };
  }
}
