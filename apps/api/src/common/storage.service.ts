import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

/**
 * STRATEGY: Abstract Storage Service
 * Handles both Cloudflare R2 (S3 compatible) and Local Filesystem fallback.
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
      this.logger.log('[Storage] Cloudflare R2 initialized.');
    } else {
      this.logger.warn('[Storage] R2 credentials missing. Falling back to Local Storage.');
    }
    this.bucketName = process.env.R2_BUCKET_NAME || 'dignify-assets';
  }

  async uploadFile(file: any, folder: 'audio' | 'avatars'): Promise<string> {
    const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    
    if (this.s3Client) {
      return this.uploadToCloud(file.buffer, `${folder}/${fileName}`, file.mimetype);
    } else {
      return this.uploadToLocal(file.buffer, fileName, folder);
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
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dignify.lanubecomputacion.com/api';
    return `${apiUrl}/uploads/${fileName}`;
  }
}
