import { Controller, Get, Patch, Post, Body, Param, BadRequestException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaService } from '../common/prisma.service';
import { StorageService } from '../common/storage.service';
import { z } from 'zod';

const UserUpdateSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  birthDate: z.string().datetime().optional(),
  image: z.string().url().optional(),
  role: z.enum(['USER', 'ARTIST']).optional(),
  spotifyId: z.string().optional(),
  youtubeId: z.string().optional(),
});

import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService
  ) {}

  @Get(':email')
  async getUser(@Param('email') email: string) {
    const user = await this.userService.findByEmail(email);
    return { data: user };
  }

  @Patch(':email')
  async updateProfile(@Param('email') email: string, @Body() body: unknown) {
    const result = UserUpdateSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.format());

    try {
      const updated = await this.userService.update(email, result.data);
      return { data: updated };
    } catch (e: any) {
      if (e.message) throw new BadRequestException(e.message);
      throw e;
    }
  }

  @Post(':email/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Param('email') email: string,
    @UploadedFile() file: any
  ) {
    if (!file) throw new BadRequestException("Archivo no subido.");
    const user = await this.userService.uploadAvatar(email, file);
    return { data: user };
  }
}
