import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../common/prisma.service';
import { StorageService } from '../common/storage.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: StorageService,
          useValue: {
            uploadFile: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return null if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      const result = await service.findByEmail('notfound@dignify.re');
      expect(result).toBeNull();
    });

    it('should return a formatted user with hasFirstDiscovery', async () => {
      const mockUser = {
        id: 'user1',
        email: 'test@dignify.re',
        favorites: [{ isFirstDiscovery: true }],
      };
      
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      
      const result = await service.findByEmail('test@dignify.re');
      
      expect(result?.hasFirstDiscovery).toBe(true);
      expect(result?.id).toBe('user1');
    });
  });
});
