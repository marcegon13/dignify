import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: 'auto', // Típico de Cloudflare R2
      endpoint: process.env.R2_ENDPOINT || '', // Ejemplo: https://<id>.r2.cloudflarestorage.com
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
    this.bucketName = process.env.R2_BUCKET_NAME || 'dignify-audio';
  }

  async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const key = `audio/${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
    
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
        ACL: 'public-read', // Para que el player pueda leerlo
      }),
    );

    // Retorna la URL pública (necesitamos el dominio del bucket o el custom domain)
    const publicDomain = process.env.R2_PUBLIC_URL || '';
    return `${publicDomain}/${key}`;
  }
}
