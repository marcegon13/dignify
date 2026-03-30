import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/**
 * STRATEGY: Optimized Storage Service with WebP Image Pipeline
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client | null = null;
  private bucketName: string;

  constructor() {
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const endpoint = process.env.R2_ENDPOINT;

    if (accessKeyId && secretAccessKey && endpoint) {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
      });
    }
    this.bucketName = process.env.R2_BUCKET_NAME || 'dignify-assets';
  }

  async uploadFile(file: any, folder: 'audio' | 'avatars' | 'covers'): Promise<string> {
    let buffer = file.buffer;
    let fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    let mimeType = file.mimetype;

    // PIPELINE INTERCEPTION: Optimize Images (WebP) - 70% optimization target
    if (folder === 'avatars' || folder === 'covers' || (mimeType && mimeType.startsWith('image/'))) {
      this.logger.log(`[Storage] Optimizing image ${fileName} for performance (WebP, scale 1000px)...`);
      try {
        buffer = await sharp(buffer)
          .resize({
            width: 1000,
            withoutEnlargement: true
          })
          .webp({ quality: 80 })
          .toBuffer();

        // Update metadata for processed image
        const nameWithoutExt = fileName.includes('.') ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName;
        fileName = `${nameWithoutExt}.webp`;
        mimeType = 'image/webp';
      } catch (err) {
        this.logger.error(`[Storage] CRITICAL: Image optimization failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    if (this.s3Client) {
      return this.uploadToCloud(buffer, `${folder}/${fileName}`, mimeType);
    } else {
      return this.uploadToLocal(buffer, fileName, folder);
    }
  }

  private async uploadToCloud(buffer: Buffer, key: string, mimeType: string): Promise<string> {
    await this.s3Client!.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ACL: 'public-read',
      }),
    );
    const publicUrl = process.env.R2_PUBLIC_URL || '';
    return `${publicUrl}/${key}`;
  }

  private async uploadToLocal(buffer: Buffer, fileName: string, folder: string): Promise<string> {
    const uploadDir = path.join(process.cwd(), 'uploads', folder);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    return `${apiUrl}/uploads/${folder}/${fileName}`;
  }
}
